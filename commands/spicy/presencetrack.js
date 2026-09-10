module.exports = {
    name: "presencetrack",
    aliases: ["ptrack", "trackpresence", "pt"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            if (!sub) {
                return await ctx.reply(
                    "*Presence Tracker*\n\n" +
                    "`.ptrack add <number>` — start tracking a number\n" +
                    "`.ptrack remove <number>` — stop tracking\n" +
                    "`.ptrack list` — show all tracked numbers\n" +
                    "`.ptrack report <number>` — activity report for a number\n" +
                    "`.ptrack report all` — full report for all tracked\n" +
                    "`.ptrack clear <number>` — wipe logs for a number\n" +
                    "`.ptrack clearall` — wipe all logs"
                );
            }

            const db  = ctx.db || global.db;
            const fs  = require("node:fs");
            const path = require("node:path");

            // ── storage ──
            const logDir = path.join(process.cwd(), "presence_logs");
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

            const getLog = (number) => {
                const file = path.join(logDir, `${number}.json`);
                try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; }
            };

            const saveLog = (number, entries) => {
                const file = path.join(logDir, `${number}.json`);
                fs.writeFileSync(file, JSON.stringify(entries, null, 2), "utf8");
            };

            const getTracked = () => {
                try { return JSON.parse(fs.readFileSync(path.join(logDir, "tracked.json"), "utf8")); } catch { return []; }
            };

            const saveTracked = (list) => {
                fs.writeFileSync(path.join(logDir, "tracked.json"), JSON.stringify(list, null, 2), "utf8");
            };

            // ── subcommands ──

            // ADD
            if (sub === "add") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number. `.ptrack add <number>`");

                const tracked = getTracked();
                if (tracked.includes(number)) {
                    return await ctx.reply(`⚠️ +${number} is already being tracked.`);
                }

                tracked.push(number);
                saveTracked(tracked);

                // subscribe to presence updates
                await sock.presenceSubscribe(`${number}@s.whatsapp.net`);

                await ctx.reply(`✅ Now tracking +${number}\nPresence updates will be logged automatically.`);
                return;
            }

            // REMOVE
            if (sub === "remove") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const tracked = getTracked().filter(n => n !== number);
                saveTracked(tracked);
                await ctx.reply(`✅ Stopped tracking +${number}`);
                return;
            }

            // LIST
            if (sub === "list") {
                const tracked = getTracked();
                if (tracked.length === 0) return await ctx.reply("📭 No numbers being tracked.");

                const lines = tracked.map((n, i) => {
                    const log = getLog(n);
                    const last = log[log.length - 1];
                    const lastSeen = last
                        ? `last seen: ${new Date(last.ts).toLocaleString("en-GB")} (${last.status})`
                        : "no data yet";
                    return `${i + 1}. +${n} — ${lastSeen}`;
                });

                await ctx.reply(`*Tracked Numbers — ${tracked.length}*\n\n${lines.join("\n")}`);
                return;
            }

            // REPORT
            if (sub === "report") {
                const target = args[1]?.replace(/[^0-9]/g, "");
                if (!target) return await ctx.reply("❌ Provide a number or 'all'.");

                const buildReport = (number) => {
                    const log = getLog(number);
                    if (log.length === 0) return `+${number}: no data yet.`;

                    // ── session builder ──
                    // group consecutive online/composing into sessions
                    const sessions = [];
                    let sessionStart = null;

                    for (const entry of log) {
                        const isActive = ["available", "composing", "recording"].includes(entry.status);
                        if (isActive && !sessionStart) {
                            sessionStart = entry.ts;
                        } else if (!isActive && sessionStart) {
                            sessions.push({ start: sessionStart, end: entry.ts });
                            sessionStart = null;
                        }
                    }
                    if (sessionStart) {
                        sessions.push({ start: sessionStart, end: Date.now() });
                    }

                    // ── pattern analysis ──
                    const hourCounts = Array(24).fill(0);
                    sessions.forEach(s => {
                        const h = new Date(s.start).getHours();
                        hourCounts[h]++;
                    });

                    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
                    const totalSessions = sessions.length;
                    const avgDuration = sessions.length
                        ? Math.round(sessions.reduce((sum, s) => sum + (s.end - s.start), 0) / sessions.length / 1000 / 60)
                        : 0;

                    const last = log[log.length - 1];
                    const lastSeen = new Date(last.ts).toLocaleString("en-GB");

                    // ── last 10 events ──
                    const recent = log.slice(-10).reverse().map(e =>
                        `  ${new Date(e.ts).toLocaleTimeString("en-GB")} — ${e.status}`
                    ).join("\n");

                    return (
                        `*Presence Report — +${number}*\n\n` +
                        `*»* *SUMMARY*\n` +
                        `  › Last Seen: ${lastSeen}\n` +
                        `  › Last Status: ${last.status}\n` +
                        `  › Total Sessions: ${totalSessions}\n` +
                        `  › Avg Session Length: ${avgDuration} min\n` +
                        `  › Peak Activity Hour: ${peakHour}:00 – ${peakHour + 1}:00\n` +
                        `  › Total Events Logged: ${log.length}\n\n` +
                        `*»* *RECENT ACTIVITY*\n${recent}`
                    );
                };

                if (args[1]?.toLowerCase() === "all") {
                    const tracked = getTracked();
                    if (tracked.length === 0) return await ctx.reply("📭 No numbers being tracked.");

                    for (const number of tracked) {
                        await ctx.reply(buildReport(number));
                        await new Promise(r => setTimeout(r, 400));
                    }
                } else {
                    await ctx.reply(buildReport(target));
                }
                return;
            }

            // CLEAR
            if (sub === "clear") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");
                const file = path.join(logDir, `${number}.json`);
                if (fs.existsSync(file)) fs.unlinkSync(file);
                await ctx.reply(`✅ Logs cleared for +${number}`);
                return;
            }

            // CLEARALL
            if (sub === "clearall") {
                const tracked = getTracked();
                tracked.forEach(n => {
                    const file = path.join(logDir, `${n}.json`);
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
                await ctx.reply(`✅ All presence logs cleared.`);
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.ptrack` for help.");

        } catch (e) {
            console.error("[presencetrack]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};