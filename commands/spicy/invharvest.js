module.exports = {
    name: "invharvest",
    aliases: ["harvestinv", "getlinks", "allinvites"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const fs = require("node:fs");
            const path = require("node:path");

            await ctx.reply("🔗 Harvesting invite links from all groups...");

            // fetch all groups bot is participating in
            const allGroups = await sock.groupFetchAllParticipating();
            const groupJids = Object.keys(allGroups);

            if (groupJids.length === 0) {
                return await ctx.reply("⚠️ Bot is not in any groups.");
            }

            const results = [];
            let success = 0;
            let failed = 0;

            for (const jid of groupJids) {
                try {
                    const meta = allGroups[jid];
                    const code = await sock.groupInviteCode(jid);
                    const link = `https://chat.whatsapp.com/${code}`;

                    results.push({
                        name: meta.subject,
                        jid,
                        members: meta.participants?.length || 0,
                        link
                    });

                    success++;
                    // breathe between requests
                    await new Promise(r => setTimeout(r, 800));
                } catch {
                    failed++;
                }
            }

            if (results.length === 0) {
                return await ctx.reply("❌ Could not harvest any links. Bot may not be admin in any group.");
            }

            // ── build text output ──
            const lines = results.map((g, i) =>
                `${i + 1}. *${g.name}*\n` +
                `   Members: ${g.members}\n` +
                `   JID: ${g.jid}\n` +
                `   Link: ${g.link}`
            );

            // ── save to file ──
            const outDir = path.join(process.cwd(), "harvested");
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

            const timestamp = Date.now();
            const txtFile = path.join(outDir, `invites_${timestamp}.txt`);
            const jsonFile = path.join(outDir, `invites_${timestamp}.json`);

            // plain links only — easy to copy-paste
            const plainLinks = results.map(g =>
                `${g.name}\n${g.link}`
            ).join("\n\n");

            fs.writeFileSync(txtFile, plainLinks, "utf8");
            fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2), "utf8");

            // ── send results ──
            // chunk into groups of 20 to avoid message size limit
            const chunkSize = 20;
            for (let i = 0; i < lines.length; i += chunkSize) {
                const chunk = lines.slice(i, i + chunkSize);
                const header = i === 0
                    ? `🔗 *Invite Link Harvest*\nTotal: ${success} links\nFailed: ${failed}\n\n`
                    : "";
                await ctx.reply(header + chunk.join("\n\n"));
                await new Promise(r => setTimeout(r, 500));
            }

            await ctx.reply(
                `📁 Saved to:\n` +
                `• harvested/invites_${timestamp}.txt\n` +
                `• harvested/invites_${timestamp}.json`
            );

        } catch (e) {
            console.error("[invharvest]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};