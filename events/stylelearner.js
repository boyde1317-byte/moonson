module.exports = (bot) => {
    const fs   = require("node:fs");
    const path = require("node:path");

    const dataDir    = path.join(process.cwd(), "impersonation");
    const trackFile  = path.join(dataDir, "tracking.json");

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const getTracked = () => {
        try { return JSON.parse(fs.readFileSync(trackFile, "utf8")); } catch { return []; }
    };

    const getProfile = (number) => {
        const file = path.join(dataDir, `${number}.json`);
        try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch {
            return { number, messages: [], createdAt: new Date().toISOString() };
        }
    };

    const saveProfile = (number, profile) => {
        const file = path.join(dataDir, `${number}.json`);
        // cap at 2000 messages
        if (profile.messages.length > 2000) {
            profile.messages = profile.messages.slice(-2000);
        }
        fs.writeFileSync(file, JSON.stringify(profile, null, 2), "utf8");
    };

    bot.on("message", async (ctx) => {
        try {
            const msg = ctx.msg || ctx.message;
            if (!msg) return;

            const fromMe = msg.key?.fromMe;
            if (fromMe) return;

            // get sender
            const jid    = msg.key?.remoteJid;
            const sender = msg.key?.participant || jid;
            if (!sender) return;

            const number = sender.split("@")[0];
            const tracked = getTracked();
            if (!tracked.includes(number)) return;

            // extract text
            const text = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                msg.message?.videoMessage?.caption ||
                ""
            ).trim();

            if (!text || text.length < 2) return;

            // log it
            const profile = getProfile(number);
            profile.messages.push({
                text,
                ts: Date.now(),
                inGroup: jid?.endsWith("@g.us") || false,
                groupJid: jid?.endsWith("@g.us") ? jid : null
            });

            saveProfile(number, profile);

        } catch (e) {
            console.error("[stylelearner]", e);
        }
    });

    console.log("[stylelearner] Loaded");
};