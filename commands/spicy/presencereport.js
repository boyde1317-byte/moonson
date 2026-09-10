module.exports = {
    name: "presenceheat",
    aliases: ["pheat", "heatmap", "activitymap"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const args = ctx.args || [];

            const number = args[0]?.replace(/[^0-9]/g, "");
            if (!number) return await ctx.reply("Usage: `.presenceheat <number>`");

            const logDir = path.join(process.cwd(), "presence_logs");
            const file   = path.join(logDir, `${number}.json`);

            if (!fs.existsSync(file)) {
                return await ctx.reply(`❌ No logs for +${number}. Start tracking first with .ptrack add ${number}`);
            }

            const log = JSON.parse(fs.readFileSync(file, "utf8"));
            if (log.length === 0) return await ctx.reply("📭 No data yet.");

            // ── build 24-hour heatmap ──
            const hourCounts = Array(24).fill(0);
            const dayCounts  = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
            const dayNames   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            log.forEach(entry => {
                if (!["available", "composing", "recording"].includes(entry.status)) return;
                const d = new Date(entry.ts);
                hourCounts[d.getHours()]++;
                dayCounts[d.getDay()]++;
            });

            const maxHour = Math.max(...hourCounts) || 1;
            const maxDay  = Math.max(...Object.values(dayCounts)) || 1;

            // ── render heatmap ──
            const barChar = (count, max) => {
                const blocks = ["░", "▒", "▓", "█"];
                const idx    = Math.floor((count / max) * (blocks.length - 1));
                return blocks[idx];
            };

            const hourRows = hourCounts.map((count, h) => {
                const label = `${String(h).padStart(2, "0")}:00`;
                const bar   = barChar(count, maxHour).repeat(Math.round((count / maxHour) * 15) || 1);
                return `${label} ${bar} (${count})`;
            });

            const dayRows = Object.entries(dayCounts).map(([d, count]) => {
                const bar = barChar(count, maxDay).repeat(Math.round((count / maxDay) * 10) || 1);
                return `${dayNames[d]} ${bar} (${count})`;
            });

            const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
            const peakDay  = dayNames[
                parseInt(Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0])
            ];

            const firstSeen = new Date(log[0].ts).toLocaleString("en-GB");
            const lastSeen  = new Date(log[log.length - 1].ts).toLocaleString("en-GB");

            const report =
                `*Activity Heatmap — +${number}*\n\n` +
                `*»* *OVERVIEW*\n` +
                `  › First Seen: ${firstSeen}\n` +
                `  › Last Seen: ${lastSeen}\n` +
                `  › Total Events: ${log.length}\n` +
                `  › Peak Hour: ${peakHour}:00 – ${peakHour + 1}:00\n` +
                `  › Most Active Day: ${peakDay}\n\n` +
                `*»* *HOURLY ACTIVITY*\n` +
                `\`\`\`\n${hourRows.join("\n")}\n\`\`\`\n\n` +
                `*»* *DAILY ACTIVITY*\n` +
                `\`\`\`\n${dayRows.join("\n")}\n\`\`\``;

            await ctx.reply(report);

        } catch (e) {
            console.error("[presenceheat]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};