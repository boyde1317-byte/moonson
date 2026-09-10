module.exports = {
    name: "massdm",
    aliases: ["mdm", "dmall"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const groupJid = ctx.msg?.key?.remoteJid;
            const text = ctx.args?.join(" ");

            if (!text) {
                return await ctx.reply("Usage: .massdm <message>\n(run in the target group)");
            }

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Run this inside the group you want to DM.");
            }

            const meta = await sock.groupMetadata(groupJid);
            const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";

            const targets = meta.participants.filter(p => p.id !== botJid);

            await ctx.reply(`📨 DMing ${targets.length} members...`);

            let sent = 0;
            let failed = 0;

            for (const p of targets) {
                try {
                    await sock.sendMessage(p.id, { text });
                    sent++;
                    await new Promise(r => setTimeout(r, 1500));
                } catch {
                    failed++;
                }
            }

            await ctx.reply(
                `✅ Mass DM done.\nSent: ${sent}\nFailed: ${failed}`
            );

        } catch (e) {
            console.error("[massdm]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};