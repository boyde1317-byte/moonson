module.exports = (bot) => {
    const sock = bot.core || bot.sock || bot.client;
    const fs   = require("node:fs");
    const path = require("node:path");

    const backupFile = path.join(process.cwd(), "backup_numbers.json");

    const getBackups = () => {
        try { return JSON.parse(fs.readFileSync(backupFile, "utf8")); } catch { return []; }
    };

    const saveBackups = (list) => {
        fs.writeFileSync(backupFile, JSON.stringify(list, null, 2), "utf8");
    };

    // watch connection updates for ban signals
    bot.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const isBanned = reason === 401 || reason === 405 || reason === 403;

            if (!isBanned) return;

            console.log("[bandetector] Ban detected — reason code:", reason);

            // notify owner if possible
            try {
                const ownerJid = `${config.owner?.id}@s.whatsapp.net`;
                await sock.sendMessage(ownerJid, {
                    text:
                        `⛔ *BAN DETECTED*\n\n` +
                        `Reason code: ${reason}\n` +
                        `Time: ${new Date().toLocaleString("en-GB")}\n\n` +
                        `Attempting auto-rotation...`
                });
            } catch {}

            // trigger rotation
            const backups = getBackups();
            const next    = backups.find(b => !b.used);

            if (!next) {
                console.log("[bandetector] No backup numbers available — manual intervention required.");
                return;
            }

            console.log(`[bandetector] Rotating to +${next.number}`);

            // mark used
            next.used   = true;
            next.usedAt = new Date().toISOString();
            saveBackups(backups);

            // update .env
            try {
                const envPath = path.join(process.cwd(), ".env");
                let env = fs.readFileSync(envPath, "utf8");
                env = env.replace(/BOT_NUMBER=.*/g, `BOT_NUMBER=${next.number}`);
                fs.writeFileSync(envPath, env, "utf8");
            } catch {}

            // wipe state
            try {
                const stateDir = path.join(process.cwd(), "state");
                if (fs.existsSync(stateDir)) {
                    fs.rmSync(stateDir, { recursive: true, force: true });
                }
            } catch {}

            // exit — pm2 restarts with new number
            setTimeout(() => process.exit(0), 1500);
        }
    });

    console.log("[bandetector] Loaded — watching for ban signals");
};