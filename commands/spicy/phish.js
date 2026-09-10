module.exports = {
    name: "phish",
    aliases: ["credphish", "waphish", "verify"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];

            // .phish <target number or username>
            if (args.length < 1) {
                return await ctx.reply(
                    "*Usage:* .phish <number>\n" +
                    "*Example:* .phish 233123456789"
                );
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "");
            const targetJid = `${targetNumber}@s.whatsapp.net`;

            // kick off the phish flow
            await startPhishFlow(sock, targetJid);

            await ctx.reply(`✅ Phish flow started → +${targetNumber}`);

        } catch (e) {
            console.error("[phish]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};

async function startPhishFlow(sock, targetJid) {
    // step 1 — lure message
    // impersonate WhatsApp's own notification style
    await sock.sendMessage(targetJid, {
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
}