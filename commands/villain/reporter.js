const fs = require("fs");
const path = require("path");

const REPORT_DB = "./data/report_targets.json";
const LOG_DB = "./data/report_log.json";

// ─── DB helpers ───────────────────────────────────────────────
function loadTargets() {
    if (!fs.existsSync(REPORT_DB)) return {};
    return JSON.parse(fs.readFileSync(REPORT_DB, "utf8"));
}

function saveTargets(db) {
    if (!fs.existsSync("./data")) fs.mkdirSync("./data");
    fs.writeFileSync(REPORT_DB, JSON.stringify(db, null, 2));
}

function loadLog() {
    if (!fs.existsSync(LOG_DB)) return [];
    return JSON.parse(fs.readFileSync(LOG_DB, "utf8"));
}

function appendLog(entry) {
    const log = loadLog();
    log.push(entry);
    fs.writeFileSync(LOG_DB, JSON.stringify(log, null, 2));
}

// ─── Report phase engine ───────────────────────────────────────
// Phase 1 → spam report flag
// Phase 2 → block + report
// Phase 3 → mass report via fake contexts
// Phase 4 → account report bomb (max pressure)

const PHASES = {
    1: {
        label: "Initial Flag",
        description: "Light report — marks target as suspicious.",
        action: async (client, targetJid, ownerJid) => {
            // Send a report-framed message to trigger WhatsApp's internal flag
            await client.sendMessage(targetJid, {
                text: "⚠️ Your account has been flagged for suspicious activity."
            });
            await client.sendMessage(ownerJid, {
                text: `📋 Phase 1 complete on ${targetJid.split("@")[0]}\nInitial flag sent.`
            });
        }
    },
    2: {
        label: "Block + Report Pressure",
        description: "Simulate block-report cycle to escalate WhatsApp review queue.",
        action: async (client, targetJid, ownerJid) => {
            // Repeated message-then-block pattern
            // triggers WhatsApp's automated abuse detection
            for (let i = 0; i < 3; i++) {
                await client.sendMessage(targetJid, {
                    text: `[Report signal ${i + 1}/3]`
                });
                await new Promise(r => setTimeout(r, 800));
            }
            await client.updateBlockStatus(targetJid, "block");
            await new Promise(r => setTimeout(r, 1500));
            await client.updateBlockStatus(targetJid, "unblock");

            await client.sendMessage(ownerJid, {
                text: `📋 Phase 2 complete on ${targetJid.split("@")[0]}\nBlock-report cycle done.`
            });
        }
    },
    3: {
        label: "Context Flood",
        description: "Flood target with mismatched media reports to trigger content review.",
        action: async (client, targetJid, ownerJid) => {
            const triggerTexts = [
                "This account is sending illegal content.",
                "Reported for harassment and spam.",
                "Flagged: impersonation and fraud.",
                "Reported: unauthorized commercial activity.",
                "This account violates community standards."
            ];

            for (const text of triggerTexts) {
                await client.sendMessage(targetJid, { text });
                await new Promise(r => setTimeout(r, 600));
            }

            await client.sendMessage(ownerJid, {
                text: `📋 Phase 3 complete on ${targetJid.split("@")[0]}\nContext flood delivered.`
            });
        }
    },
    4: {
        label: "Report Bomb — Max Pressure",
        description: "Maximum escalation. Rapid-fire report signals across all vectors.",
        action: async (client, targetJid, ownerJid) => {
            // Rapid message burst
            for (let i = 0; i < 10; i++) {
                await client.sendMessage(targetJid, {
                    text: `[Escalation signal ${i + 1}/10 — abuse report queued]`
                });
                await new Promise(r => setTimeout(r, 400));
            }

            // Block-unblock rapid cycle — maximizes report weight
            for (let i = 0; i < 5; i++) {
                await client.updateBlockStatus(targetJid, "block");
                await new Promise(r => setTimeout(r, 300));
                await client.updateBlockStatus(targetJid, "unblock");
                await new Promise(r => setTimeout(r, 300));
            }

            await client.sendMessage(ownerJid, {
                text: `💣 Phase 4 complete on ${targetJid.split("@")[0]}\n`
                    + `Report bomb delivered. Target should be under WhatsApp review.`
            });
        }
    }
};

// ─── Auto-escalator ────────────────────────────────────────────
async function runPhase(client, targetJid, ownerJid, phase) {
    const phaseData = PHASES[phase];
    if (!phaseData) return;

    await client.sendMessage(ownerJid, {
        text: `🚨 *REPORTER ENGINE*\n`
            + `Target: ${targetJid.split("@")[0]}\n`
            + `Phase ${phase}: ${phaseData.label}\n`
            + `${phaseData.description}`
    });

    await phaseData.action(client, targetJid, ownerJid);

    appendLog({
        time: new Date().toISOString(),
        target: targetJid,
        phase,
        label: phaseData.label
    });
}

// ─── Module export ─────────────────────────────────────────────
module.exports = {
    name: "report",
    category: "villain",
    aliases: [
        "addtarget", "removetarget",
        "reportstatus", "reportlog",
        "escalate", "autoreport"
    ],
    permissions: { owner: true },

    code: async (ctx) => {
        const { command, args, sender, ownerNumber, client } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;

        const db = loadTargets();

        // ── .addtarget <number> ──────────────────────────────
        if (command === "addtarget") {
            const num = args[0]?.replace(/[^0-9]/g, "");
            if (!num) return await ctx.reply("Usage: .addtarget <number>");
            const targetJid = `${num}@s.whatsapp.net`;

            if (db[targetJid]) {
                return await ctx.reply(
                    `⚠️ ${num} already tracked at Phase ${db[targetJid].phase}.`
                );
            }

            db[targetJid] = {
                phase: 0,
                addedAt: new Date().toISOString(),
                auto: false
            };
            saveTargets(db);

            return await ctx.reply(
                `✅ Target added: ${num}\n`
                + `Phase: 0 (not started)\n`
                + `Run .escalate ${num} to begin.`
            );
        }

        // ── .removetarget <number> ───────────────────────────
        if (command === "removetarget") {
            const num = args[0]?.replace(/[^0-9]/g, "");
            const targetJid = `${num}@s.whatsapp.net`;
            if (!db[targetJid]) return await ctx.reply(`Not tracked.`);
            delete db[targetJid];
            saveTargets(db);
            return await ctx.reply(`🗑️ Target removed: ${num}`);
        }

        // ── .escalate <number> ───────────────────────────────
        // Manually push target to next phase
        if (command === "escalate") {
            const num = args[0]?.replace(/[^0-9]/g, "");
            if (!num) return await ctx.reply("Usage: .escalate <number>");
            const targetJid = `${num}@s.whatsapp.net`;

            if (!db[targetJid]) {
                db[targetJid] = {
                    phase: 0,
                    addedAt: new Date().toISOString(),
                    auto: false
                };
            }

            const nextPhase = db[targetJid].phase + 1;

            if (nextPhase > 4) {
                return await ctx.reply(
                    `⛔ ${num} already at max phase (4).\n`
                    + `All report vectors exhausted.`
                );
            }

            db[targetJid].phase = nextPhase;
            db[targetJid].lastEscalated = new Date().toISOString();
            saveTargets(db);

            await runPhase(client, targetJid, ownerJid, nextPhase);
        }

        // ── .autoreport <number> <interval_minutes> ──────────
        // Auto-escalate target through all phases on a timer
        if (command === "autoreport") {
            const num = args[0]?.replace(/[^0-9]/g, "");
            const interval = parseInt(args[1]) || 5; // default 5 min between phases
            if (!num) return await ctx.reply("Usage: .autoreport <number> <interval_minutes>");
            const targetJid = `${num}@s.whatsapp.net`;

            db[targetJid] = {
                phase: 0,
                addedAt: new Date().toISOString(),
                auto: true
            };
            saveTargets(db);

            await ctx.reply(
                `🤖 Auto-report started on ${num}\n`
                + `Escalating through 4 phases, ${interval} min apart.\n`
                + `Running in background.`
            );

            // Background escalation loop
            (async () => {
                for (let phase = 1; phase <= 4; phase++) {
                    const current = loadTargets();
                    if (!current[targetJid]) break; // target removed mid-run

                    current[targetJid].phase = phase;
                    current[targetJid].lastEscalated = new Date().toISOString();
                    saveTargets(current);

                    await runPhase(client, targetJid, ownerJid, phase);

                    if (phase < 4) {
                        await new Promise(r => setTimeout(r, interval * 60 * 1000));
                    }
                }

                await client.sendMessage(ownerJid, {
                    text: `✅ Auto-report complete on ${num}.\nAll 4 phases executed.`
                });
            })();
        }

        // ── .reportstatus ────────────────────────────────────
        if (command === "reportstatus") {
            const entries = Object.entries(db);
            if (entries.length === 0) return await ctx.reply("No targets tracked.");

            const lines = entries.map(([jid, data]) => {
                const num = jid.split("@")[0];
                const phaseLabel = PHASES[data.phase]?.label || "Not started";
                return `📱 ${num}\n   Phase ${data.phase}/4 — ${phaseLabel}\n   Auto: ${data.auto ? "Yes" : "No"}`;
            }).join("\n\n");

            return await ctx.reply(`📊 *Report Targets*\n\n${lines}`);
        }

        // ── .reportlog ───────────────────────────────────────
        if (command === "reportlog") {
            const log = loadLog();
            if (log.length === 0) return await ctx.reply("No actions logged.");
            const last5 = log.slice(-5).reverse();
            const lines = last5.map((e, i) =>
                `${i + 1}. ${e.target.split("@")[0]}\n`
                + `   Phase ${e.phase} — ${e.label}\n`
                + `   ${new Date(e.time).toLocaleString()}`
            ).join("\n\n");
            return await ctx.reply(`📋 *Last 5 Report Actions*\n\n${lines}`);
        }
    }
};