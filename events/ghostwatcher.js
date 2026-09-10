module.exports = (bot) => {
    const fs   = require("node:fs");
    const path = require("node:path");
    const sock = bot.core || bot.sock || bot.client;

    const dataDir   = path.join(process.cwd(), "ghost_data");
    const trackFile = path.join(dataDir, "targets.json");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const getTargets = () => {
        try { return JSON.parse(fs.readFileSync(trackFile, "utf8")); } catch { return {}; }
    };

    const getProfile = (number) => {
        const file = path.join(dataDir, `${number}.json`);
        try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch {
            return { number, presenceLog: [], typingEvents: [], profilePics: [], statusHistory: [], name: null, lastSeen: null, lastStatus: null };
        }
    };

    const saveProfile = (number, profile) => {
        const file = path.join(dataDir, `${number}.json`);
        if (profile.presenceLog.length > 2000) profile.presenceLog = profile.presenceLog.slice(-2000);
        if (profile.typingEvents.length > 500)  profile.typingEvents = profile.typingEvents.slice(-500);
        fs.writeFileSync(file, JSON.stringify(profile, null, 2), "utf8");
    };

    // resubscribe on reconnect
    const subscribeAll = async () => {
        const targets = getTargets();
        for (const number of Object.keys(targets)) {
            try {
                await sock.presenceSubscribe(`${number}@s.whatsapp.net`);
                await new Promise(r => setTimeout(r, 400));
            } catch {}
        }
    };

    // presence updates
    bot.on("presence.update", async ({ id, presences }) => {
        try {
            const number  = id.split("@")[0];
            const targets = getTargets();
            if (!targets[number]) return;

            const presence = presences[id];
            if (!presence) return;

            const profile = getProfile(number);
            const status  = presence.lastKnownPresence;
            const entry   = { status, ts: Date.now() };

            profile.presenceLog.push(entry);
            profile.lastStatus = status;
            profile.lastSeen   = Date.now();

            if (status === "composing" || status === "recording") {
                profile.typingEvents.push({ type: status, ts: Date.now() });
            }

            saveProfile(number, profile);

        } catch (e) { console.error("[ghostwatcher presence]", e); }
    });

    // catch push name from messages
    bot.on("message", async (ctx) => {
        try {
            const msg  = ctx.msg || ctx.message;
            if (!msg || msg.key?.fromMe) return;

            const sender = msg.key?.participant || msg.key?.remoteJid;
            if (!sender) return;

            const number  = sender.split("@")[0];
            const targets = getTargets();
            if (!targets[number]) return;

            const pushName = msg.pushName;
            if (!pushName) return;

            const profile = getProfile(number);
            if (profile.name !== pushName) {
                profile.name = pushName;
                saveProfile(number, profile);
            }
        } catch {}
    });

    // periodic profile pic check — every 6 hours
    setInterval(async () => {
        const targets = getTargets();
        for (const number of Object.keys(targets)) {
            try {
                const jid    = `${number}@s.whatsapp.net`;
                const picUrl = await sock.profilePictureUrl(jid, "image");
                const profile = getProfile(number);
                const already = profile.profilePics.find(p => p.url === picUrl);
                if (!already) {
                    profile.profilePics.push({ url: picUrl, ts: Date.now() });
                    saveProfile(number, profile);
                    // notify owner of pic change
                    const ownerJid = `${config.owner?.id}@s.whatsapp.net`;
                    await sock.sendMessage(ownerJid, {
                        image: { url: picUrl },
                        caption: `📸 +${number} changed their profile pic`
                    });
                }
            } catch {}
            await new Promise(r => setTimeout(r, 1000));
        }
    }, 6 * 60 * 60 * 1000);

    // resubscribe on reconnect
    bot.on("connection.update", ({ connection }) => {
        if (connection === "open") subscribeAll();
    });

    subscribeAll();
    console.log("[ghostwatcher] Loaded");
};