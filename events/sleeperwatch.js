module.exports = (bot) => {
    const fs   = require("node:fs");
    const path = require("node:path");
    const sock = bot.core || bot.sock || bot.client;

    const cfgFile = path.join(process.cwd(), "sleeper.json");

    const getCfg = () => {
        try { return JSON.parse(fs.readFileSync(cfgFile, "utf8")); } catch { return { active: false, activationCode: null, scheduledOps: [] }; }
    };
    const saveCfg = (cfg) => fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2), "utf8");

    bot.on("message", async (ctx) => {
        try {
            const msg = ctx.msg || ctx.message;
            if (!msg || msg.key?.fromMe) return;

            const sender = msg.key?.participant || msg.key?.remoteJid;
            const ownerNum = config.owner?.id;
            if (!sender?.includes(ownerNum)) return;

            const text = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text || ""
            ).trim();

            const cfg = getCfg();
            if (!cfg.activationCode || cfg.active) return;
            if (text !== cfg.activationCode) return;

            // ── ACTIVATION ──
            cfg.active      = true;
            cfg.activatedAt = new Date().toISOString();
            saveCfg(cfg);

            const ownerJid = `${ownerNum}@s.whatsapp.net`;
            await sock.sendMessage(ownerJid, {
                text:
                    `🟢 *SLEEPER ACTIVATED*\n\n` +
                    `Code: ${cfg.activationCode}\n` +
                    `Time: ${new Date().toLocaleString("en-GB")}\n` +
                    `Ops queued: ${cfg.scheduledOps.length}\n\n` +
                    `Executing now...`
            });

            // execute all scheduled ops
            for (const op of cfg.scheduledOps) {
                try {
                    await sock.sendMessage(ownerJid, {
                        text: `⚡ Executing: \`${op.op} ${op.args}\``
                    });

                    // trigger the command as if owner sent it
                    const fakeCtx = {
                        ...ctx,
                        args: op.args ? op.args.split(" ") : [],
                        used: { command: op.op, prefix: config.bot?.prefix || "." }
                    };

                    const cmd = ctx.bot?.cmd?.get(op.op);
                    if (cmd?.code) {
                        await cmd.code(fakeCtx);
                    } else {
                        await sock.sendMessage(ownerJid, { text: `⚠️ Op not found: ${op.op}` });
                    }

                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    await sock.sendMessage(ownerJid, {
                        text: `❌ Op failed: ${op.op} — ${e.message}`
                    });
                }
            }

            await sock.sendMessage(ownerJid, {
                text: `✅ All ops executed. Sleeper is now active.`
            });

        } catch (e) {
            console.error("[sleeperwatch]", e);
        }
    });

    console.log("[sleeperwatch] Loaded");
};