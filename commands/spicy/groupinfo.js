module.exports = {
    name: "groupinfo",
    aliases: ["ginfo", "gi"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: false },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const groupJid = ctx.msg?.key?.remoteJid;

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Use this in a group.");
            }

            const meta = await sock.groupMetadata(groupJid);
            const admins = meta.participants.filter(p => p.admin).map(p => `+${p.id.split("@")[0]}`);
            const created = new Date(meta.creation * 1000).toLocaleString("en-GB");

            const info =
                `*Group Info — ${meta.subject}*\n\n` +
                `JID: ${groupJid}\n` +
                `Members: ${meta.participants.length}\n` +
                `Admins: ${admins.length}\n` +
                `Created: ${created}\n` +
                `Restricted: ${meta.restrict ? "Yes" : "No"}\n` +
                `Announce only: ${meta.announce ? "Yes" : "No"}\n\n` +
                `*Admins:*\n${admins.join("\n")}\n\n` +
                `*Description:*\n${meta.desc || "None"}`;

            await ctx.reply(info);

        } catch (e) {
            console.error("[groupinfo]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};