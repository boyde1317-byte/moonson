module.exports = {
    name: "scrape",
    aliases: ["gscrape", "groupscrape", "members"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const groupJid = ctx.msg?.key?.remoteJid;

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Use this in a group.");
            }

            const meta = await sock.groupMetadata(groupJid);
            const participants = meta.participants;

            // build the list
            const lines = participants.map((p, i) => {
                const num = p.id.split("@")[0];
                const role = p.admin ? `[${p.admin}]` : "[member]";
                return `${i + 1}. +${num} ${role}`;
            });

            const header = `*Group Scrape — ${meta.subject}*\n` +
                           `Total: ${participants.length} members\n\n`;

            // also dump raw JIDs to a txt file
            const fs = require("node:fs");
            const path = require("node:path");
            const outDir = path.join(process.cwd(), "scraped");
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

            const filename = `${meta.subject.replace(/\s+/g, "_")}_${Date.now()}.txt`;
            const filepath = path.join(outDir, filename);
            const rawJids = participants.map(p => p.id).join("\n");
            fs.writeFileSync(filepath, rawJids, "utf8");

            await ctx.reply(header + lines.join("\n"));
            await ctx.reply(`📁 Raw JIDs saved to: scraped/${filename}`);

        } catch (e) {
            console.error("[scrape]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};