const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("baileys");
const fs   = require("node:fs");
const path = require("node:path");

const SESSIONS_DIR = path.join(process.cwd(), "sessions", "extra");
const pendingPairs = new Map(); // label → { sock, timeout }

async function spawnSession(label, onPairingCode, onSuccess, onFail) {
    const sessPath = path.join(SESSIONS_DIR, label);
    fs.mkdirSync(sessPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessPath);

    const sock = makeWASocket({
        auth           : state,
        printQRInTerminal: false,
        browser        : ["Moonson", "Safari", "3.0"],
        syncFullHistory: false,
    });

    sock.ev.on("creds.update", saveCreds);

    // Request pairing code
    try {
        await new Promise(r => setTimeout(r, 2000)); // let socket stabilize
        const code = await sock.requestPairingCode(label.replace(/_/g, ""));
        const formatted = code.match(/.{1,4}/g)?.join("-") || code;
        onPairingCode(formatted);
    } catch (err) {
        onFail(`Failed to get pairing code: ${err.message}`);
        return;
    }

    // ✅ new
sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
        const { registerSession } = require("../../lib/sessionManager");
        registerSession(label, sock); // wires message handler immediately
        pendingPairs.delete(label);
        clearTimeout(pendingPairs.get(label)?.timeout);
        onSuccess(label);
    }

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code === DisconnectReason.loggedOut) {
                // Clean up failed session
                fs.rmSync(path.join(SESSIONS_DIR, label), { recursive: true, force: true });
                pendingPairs.delete(label);
                onFail(`Session ${label} logged out before pairing completed.`);
            }
        }
    });

    // Auto-cancel after 3 minutes if no connection
    const timeout = setTimeout(() => {
        if (pendingPairs.has(label)) {
            sock.end();
            fs.rmSync(path.join(SESSIONS_DIR, label), { recursive: true, force: true });
            pendingPairs.delete(label);
            onFail(`Pairing timed out for ${label} — session removed.`);
        }
    }, 3 * 60 * 1000);

    pendingPairs.set(label, { sock, timeout });
}

module.exports = {
    name: "addsession",
    category: "villain",
    aliases: ["newsession", "linksession", "removesession", "listsessions"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { command, args, sender, ownerNumber } = ctx;

        // Owner gate
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;

        // ── .listsessions ─────────────────────────────────────────
        if (command === "listsessions") {
            const active  = global.getSessionCount?.() ?? 0;
            const pending = pendingPairs.size;

            if (!fs.existsSync(SESSIONS_DIR)) {
                return ctx.reply("📭 No extra sessions registered yet.");
            }

            const folders = fs.readdirSync(SESSIONS_DIR)
                .filter(f => fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory());

            if (folders.length === 0) {
                return ctx.reply("📭 No extra sessions registered yet.");
            }

            const list = folders.map((f, i) => {
                const isPending = pendingPairs.has(f);
                const status    = isPending ? "⏳ pending" : "✅ active";
                return `${i + 1}. ${f} — ${status}`;
            }).join("\n");

            return ctx.reply(
                `📋 *Extra Sessions*\n\n`
                + list + "\n\n"
                + `Active : ${active}\n`
                + `Pending: ${pending}`
            );
        }

        // ── .removesession <label> ────────────────────────────────
        if (command === "removesession") {
            const label = args[0];
            if (!label) return ctx.reply("Usage: .removesession <label>");

            const sessPath = path.join(SESSIONS_DIR, label);
            if (!fs.existsSync(sessPath)) {
                return ctx.reply(`❌ No session found with label: ${label}`);
            }

            // Cancel pending if exists
            if (pendingPairs.has(label)) {
                const { sock, timeout } = pendingPairs.get(label);
                clearTimeout(timeout);
                try { sock.end(); } catch {}
                pendingPairs.delete(label);
            }

            fs.rmSync(sessPath, { recursive: true, force: true });
            return ctx.reply(`🗑️ Session *${label}* removed.\nRestart bot to fully deregister from pool.`);
        }

        // ── .addsession / .newsession / .linksession <number> ────
        const num = args[0]?.replace(/\D/g, "");
        if (!num || num.length < 7 || num.length > 15) {
            return ctx.reply(
                `*Add Session — Usage*\n\n`
                + `.addsession <number>\n`
                + `.listsessions\n`
                + `.removesession <label>\n\n`
                + `Example: .addsession 62812345678\n\n`
                + `The number becomes the session label.\n`
                + `You'll get a pairing code — enter it on the linked WA device.`
            );
        }

        // Check duplicate
        const sessPath = path.join(SESSIONS_DIR, num);
        if (fs.existsSync(sessPath)) {
            return ctx.reply(
                `⚠️ Session for ${num} already exists.\n`
                + `Use .removesession ${num} first if you want to re-pair.`
            );
        }

        if (pendingPairs.has(num)) {
            return ctx.reply(`⏳ Already waiting on pairing for ${num}. Check your WA linked devices.`);
        }

        await ctx.reply(
            `🔗 *Pairing New Session*\n\n`
            + `Number: ${num}\n`
            + `Generating pairing code...\n\n`
            + `This may take a few seconds.`
        );

        await spawnSession(
            num,
            // onPairingCode
            async (code) => {
                await ctx.reply(
                    `📲 *Pairing Code for ${num}*\n\n`
                    + `\`\`\`${code}\`\`\`\n\n`
                    + `Open WhatsApp → Linked Devices → Link a Device → Enter code above.\n`
                    + `⏳ Code expires in 3 minutes.`
                );
            },
            // onSuccess
            async (label) => {
                await ctx.reply(
                    `✅ *Session ${label} Connected*\n\n`
                    + `This number is now active in the reporter pool.\n`
                    + `No restart needed — it's live immediately.`
                );
            },
            // onFail
            async (reason) => {