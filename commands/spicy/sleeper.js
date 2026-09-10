module.exports = {
    name: "sleeper",
    aliases: ["sleeperagent", "dormant", "activate"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const cfgFile = path.join(process.cwd(), "sleeper.json");

            const getCfg = () => {
                try { return JSON.parse(fs.readFileSync(cfgFile, "utf8")); } catch {
                    return {
                        active: false,
                        activationCode: null,
                        dormantSince: null,
                        activatedAt: null,
                        scheduledOps: []
                    };
                }
            };

            const saveCfg = (cfg) => {
                fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2), "utf8");
            };

            if (!sub) {
                const cfg = getCfg();
                return await ctx.reply(
                    "*Sleeper Agent*\n\n" +
                    "`.sleeper arm <code>` — arm sleeper with activation code\n" +
                    "`.sleeper disarm` — disarm sleeper\n" +
                    "`.sleeper status` — current state\n" +
                    "`.sleeper schedule <op> <args>` — queue an op for when activated\n" +
                    "`.sleeper ops` — view scheduled ops\n" +
                    "`.sleeper clearops` — clear all scheduled ops\n\n" +
                    `Current state: ${cfg.active ? "🟢 ACTIVE" : cfg.activationCode ? "😴 ARMED/DORMANT" : "⚪ DISARMED"}\n` +
                    `Activation code: ${cfg.activationCode ? `\`${cfg.activationCode}\`` : "not set"}`
                );
            }

            // ARM
            if (sub === "arm") {
                const code = args[1];
                if (!code || code.length < 4) {
                    return await ctx.reply("❌ Provide an activation code (min 4 chars).");
                }

                const cfg = getCfg();
                cfg.active         = false;
                cfg.activationCode = code;
                cfg.dormantSince   = new Date().toISOString();
                saveCfg(cfg);

                await ctx.reply(
                    `😴 Sleeper armed.\n\n` +
                    `Activation code: \`${code}\`\n` +
                    `State: DORMANT\n\n` +
                    `Bot will respond normally to all commands.\n` +
                    `When owner sends \`${code}\` in any chat — all scheduled ops fire instantly.`
                );
                return;
            }

            // DISARM
            if (sub === "disarm") {
                const cfg = getCfg();
                cfg.active         = false;
                cfg.activationCode = null;
                saveCfg(cfg);
                await ctx.reply("✅ Sleeper disarmed.");
                return;
            }

            // STATUS
            if (sub === "status") {
                const cfg = getCfg();
                await ctx.reply(
                    `*Sleeper Status*\n\n` +
                    `State: ${cfg.active ? "🟢 ACTIVE" : cfg.activationCode ? "😴 ARMED" : "⚪ DISARMED"}\n` +
                    `Activation code: ${cfg.activationCode || "none"}\n` +
                    `Armed since: ${cfg.dormantSince ? new Date(cfg.dormantSince).toLocaleString("en-GB") : "N/A"}\n` +
                    `Activated at: ${cfg.activatedAt ? new Date(cfg.activatedAt).toLocaleString("en-GB") : "not yet"}\n` +
                    `Scheduled ops: ${cfg.scheduledOps.length}`
                );
                return;
            }

            // SCHEDULE OP
            if (sub === "schedule") {
                const op   = args[1];
                const opArgs = args.slice(2).join(" ");

                if (!op) return await ctx.reply("❌ Provide an op. Example: .sleeper schedule phishblast");

                const cfg = getCfg();
                cfg.scheduledOps.push({
                    op,
                    args: opArgs,
                    addedAt: new Date().toISOString()
                });
                saveCfg(cfg);

                await ctx.reply(
                    `✅ Op scheduled.\n` +
                    `Will fire on activation: \`${op} ${opArgs}\`\n` +
                    `Total queued: ${cfg.scheduledOps.length}`
                );
                return;
            }

            // OPS
            if (sub === "ops") {
                const cfg = getCfg();
                if (!cfg.scheduledOps.length) return await ctx.reply("📭 No ops scheduled.");

                const lines = cfg.scheduledOps.map((op, i) =>
                    `${i+1}. \`${op.op} ${op.args}\``
                );

                await ctx.reply(`*Scheduled Ops — fires on activation*\n\n${lines.join("\n")}`);
                return;
            }

            // CLEAROPS
            if (sub === "clearops") {
                const cfg = getCfg();
                cfg.scheduledOps = [];
                saveCfg(cfg);
                await ctx.reply("✅ Scheduled ops cleared.");
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.sleeper` for help.");

        } catch (e) {
            console.error("[sleeper]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};