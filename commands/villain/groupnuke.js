// Nuclear option — kick everyone from the group except bot and owner
// Use when you want to empty a hijacked group

module.exports = {
    name: "groupnuke",
    category: "villain",
    aliases: ["emptygroupp", "kickall"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { groupId, sender, ownerNumber, client } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;
        if (!groupId) return await ctx.reply("❌ Group only.");

        const meta = await client.groupMetadata(groupId);
        const botJid = client.user.id.replace(/:.*@/, "@");

        const targets = meta.participants
            .filter(p => p.id !== botJid && p.id !== ownerJid)
            .map(p => p.id);

        if (targets.length === 0) return await ctx.reply("Group already empty.");

        await ctx.reply(`💣 Nuking ${targets.length} members... stand by.`);

        const chunk = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        for (const batch of chunk(targets, 5)) {
            await client.groupParticipantsUpdate(groupId, batch, "remove");
            await new Promise(r => setTimeout(r, 1000));
        }

        await ctx.reply(`✅ Done. Kicked ${targets.length} member(s).`);
    }
};