module.exports = {
    name: "autonumber",
    aliases: ["numrotate", "autorotate", "backupnum"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const backupFile = path.join(process.cwd(), "backup_numbers.json");

            const getBackups = () => {
                try { return JSON.parse(fs.readFileSync(backupFile, "utf8")); } catch { return []; }
            };

            const saveBackups = (list) => {
                fs.writeFileSync(backupFile, JSON.stringify(list, null, 2), "utf8");
            };

            if (!sub) {
                const backups = getBackups();
                return await ctx.reply(
                    "*Auto Number Rotation*\n\n" +
                    "`.autonumber add <number>` — add backup number\n" +
                    "`.autonumber remove <number>` — remove backup\n" +
                    "`.autonumber list` — show backup queue\n" +
                    "`.autonumber rotate` — manually trigger rotation\n" +
                    "`.autonumber status` — show current number + queue\n\n" +
                    `Current backups in queue: ${backups.length}`
                );
            }

            // ADD
            if (sub === "add") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const backups = getBackups();
                if (backups.find(b => b.number === number)) {
                    return await ctx.reply(`⚠️ +${number} already in queue.`);
                }

                backups.push({
                    number,
                    addedAt: new Date().toISOString(),
                    used: false
                });
                saveBackups(backups);

                await ctx.reply(
                    `✅ +${number} added to backup queue.\n` +
                    `Queue position: ${backups.length}`
                );
                return;
            }

            // REMOVE
            if (sub === "remove") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                const backups = getBackups().filter(b => b.number !== number);
                saveBackups(backups);
                await ctx.reply(`✅ +${number} removed from queue.`);
                return;
            }

            // LIST
            if (sub === "list") {
                const backups = getBackups();
                if (backups.length === 0) return await ctx.reply("📭 No backup numbers in queue.");

                const sock = ctx.core || ctx.sock || ctx.client;
                const current = sock.user?.id?.split("@")[0]?.split(":")[0] || "unknown";

                const lines = backups.map((b, i) =>
                    `${i + 1}. +${b.number} ${b.used ? "[used]" : "[ready]"} — added ${new Date(b.addedAt).toLocaleDateString("en-GB")}`
                );

                await ctx.reply(
                    `*Backup Number Queue*\n\n` +
                    `Current: +${current}\n\n` +
                    lines.join("\n")
                );
                return;
            }

            // STATUS
            if (sub === "status") {
                const sock = ctx.core || ctx.sock || ctx.client;
                const current = sock.user?.id?.split("@")[0]?.split(":")[0] || "unknown";
                const backups = getBackups();
                const ready   = backups.filter(b => !b.used);

                await ctx.reply(
                    `*Rotation Status*\n\n` +
                    `Current Number: +${current}\n` +
                    `Backup Queue: ${backups.length} total\n` +
                    `Ready: ${ready.length}\n` +
                    `Used: ${backups.length - ready.length}\n\n` +
                    `Next up: ${ready[0] ? `+${ready[0].number}` : "none — add more with .autonumber add"}`
                );
                return;
            }

            // ROTATE — manual trigger
            if (sub === "rotate") {
                const backups = getBackups();
                const next    = backups.find(b => !b.used);

                if (!next) {
                    return await ctx.reply(
                        "❌ No unused backup numbers in queue.\n" +
                        "Add one with `.autonumber add <number>`"
                    );
                }

                await ctx.reply(
                    `🔄 *Rotation Triggered*\n\n` +
                    `Switching to: +${next.number}\n\n` +
                    `Steps:\n` +
                    `1. Delete \`state/\` folder\n` +
                    `2. Set BOT_NUMBER=${next.number} in .env\n` +
                    `3. Restart bot — new pairing code will generate\n` +
                    `4. Link +${next.number} via pairing code\n\n` +
                    `Auto-rotating now...`
                );

                // mark as used
                next.used = true;
                next.usedAt = new Date().toISOString();
                saveBackups(backups);

                // write new number to .env
                const fs   = require("node:fs");
                const path = require("node:path");
                const envPath = path.join(process.cwd(), ".env");

                try {
                    let env = fs.readFileSync(envPath, "utf8");
                    env = env.replace(/BOT_NUMBER=.*/g, `BOT_NUMBER=${next.number}`);
                    fs.writeFileSync(envPath, env, "utf8");
                    await ctx.reply(`✅ .env updated → BOT_NUMBER=${next.number}`);
                } catch {
                    await ctx.reply(`⚠️ Could not auto-update .env — update BOT_NUMBER manually to ${next.number}`);
                }

                // wipe auth state so bot re-pairs with new number
                try {
                    const stateDir = path.join(process.cwd(), "state");
                    if (fs.existsSync(stateDir)) {
                        fs.rmSync(stateDir, { recursive: true, force: true });
                        await ctx.reply("✅ Auth state wiped. Restarting...");
                    }
                } catch {}

                // trigger restart via process exit — pm2/forever will restart
                setTimeout(() => process.exit(0), 2000);
                return;
            }

            await ctx.reply("❌ Unknown subcommand.");

        } catch (e) {
            console.error("[autonumber]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};