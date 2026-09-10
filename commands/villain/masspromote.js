// Mass promote everyone in the group to admin
// Chaos tool — use to overwhelm a group's admin structure

module.exports = {
    name: "masspromote",
    category: "villain",
    aliases: ["adminflood", "promoteall"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { groupId, sender, ownerNumber, client } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;
        if (!groupId) return await ctx.reply("❌ Group only.");

        const meta = await client.groupMetadata(groupId);
        const botJid = client.user.id.replace(/:.*@/, "@");

        const targets = meta.participants
            .filter(p => p.admin == null && p.id !== botJid)
            .map(p => p.id);

        if (targets.length === 0) return await ctx.reply("Everyone's already admin.");

        // Baileys limit: batch in chunks of 5 to avoid rate limit
        const chunk = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        for (const batch of chunk(targets, 5)) {
            await client.groupParticipantsUpdate(groupId, batch, "promote");
            await new Promise(r => setTimeout(r, 1200)); // breathe between batches
        }

        await ctx.reply(`👑 Mass promoted ${targets.length} member(s) to admin.`);
    }
};