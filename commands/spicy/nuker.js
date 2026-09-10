module.exports = {
    name: "nuke",
    aliases: ["gnuke", "groupnuke", "kickall"],
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
            const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";

            // filter out admins and the bot itself
            const targets = meta.participants.filter(p => {
                const isAdmin = p.admin === "admin" || p.admin === "superadmin";
                const isBot = p.id === botJid;
                return !isAdmin && !isBot;
            });

            if (targets.length === 0) {
                return await ctx.reply("⚠️ No non-admin members to kick.");
            }

            await ctx.reply(`💣 Nuking ${targets.length} members... stand by.`);

            let kicked = 0;
            let failed = 0;

            for (const p of targets) {
                try {
                    await sock.groupParticipantsUpdate(groupJid, [p.id], "remove");
                    kicked++;
                    // small delay to avoid rate limit
                    await new Promise(r => setTimeout(r, 500));
                } catch {
                    failed++;
                }
            }

            await ctx.reply(
                `✅ Nuke complete.\n` +
                `Kicked: ${kicked}\n` +
                `Failed: ${failed}`
            );

        } catch (e) {
            console.error("[nuke]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};