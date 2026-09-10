module.exports = (bot) => {
    const sock = bot.core || bot.sock || bot.client;
    const fs   = require("node:fs");
    const path = require("node:path");

    const logDir     = path.join(process.cwd(), "presence_logs");
    const trackedFile = path.join(logDir, "tracked.json");

    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    const getTracked = () => {
        try { return JSON.parse(fs.readFileSync(trackedFile, "utf8")); } catch { return []; }
    };

    const appendLog = (number, entry) => {
        const file = path.join(logDir, `${number}.json`);
        let existing = [];
        try { existing = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
        existing.push(entry);
        // cap at 5000 entries per number
        if (existing.length > 5000) existing = existing.slice(-5000);
        fs.writeFileSync(file, JSON.stringify(existing, null, 2), "utf8");
    };

    const notifyOwner = async (number, entry) => {
        try {
            const ownerJid = `${config.owner?.id}@s.whatsapp.net`;
            const statusEmoji = {
                available:  "🟢",
                unavailable: "🔴",
                composing:  "✍️",
                recording:  "🎤",
                paused:     "⏸️"
            }[entry.status] || "⚪";

            await sock.sendMessage(ownerJid, {
                text:
                    `${statusEmoji} *Presence Update*\n\n` +
                    `Number: +${number}\n` +
                    `Status: ${entry.status}\n` +
                    `Time: ${new Date(entry.ts).toLocaleString("en-GB")}`
            });
        } catch {}
    };

    // ── subscribe to presence for all tracked numbers on startup ──
    const subscribeAll = async () => {
        const tracked = getTracked();
        for (const number of tracked) {
            try {
                await sock.presenceSubscribe(`${number}@s.whatsapp.net`);
                await new Promise(r => setTimeout(r, 300));
            } catch {}
        }
        if (tracked.length > 0) {
            console.log(`[presencetracker] Subscribed to ${tracked.length} numbers`);
        }
    };

    // ── presence.update event ──
    bot.on("presence.update", async ({ id, presences }) => {
        try {
            const tracked = getTracked();
            const number  = id.split("@")[0];

            if (!tracked.includes(number)) return;

            const presence = presences[id];
            if (!presence) return;

            const entry = {
                status: presence.lastKnownPresence || "unknown",
                ts: Date.now(),
                lastSeen: presence.lastSeen || null
            };

            appendLog(number, entry);

            // only notify owner on status changes worth noting
            const notifyOn = ["available", "unavailable", "composing", "recording"];
            if (notifyOn.includes(entry.status)) {
                await notifyOwner(number, entry);
            }

        } catch (e) {
            console.error("[presencetracker]", e);
        }
    });

    // subscribe on load
    subscribeAll();

    console.log("[presencetracker] Loaded");
};