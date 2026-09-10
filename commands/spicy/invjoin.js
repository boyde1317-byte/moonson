module.exports = {
    name: "invjoin",
    aliases: ["joinlinks", "joinall"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const text = ctx.args?.join(" ") || "";

            // extract all wa invite links from the message
            const regex = /https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9]+)/g;
            const matches = [...text.matchAll(regex)];
            const codes = matches.map(m => m[1]);

            if (codes.length === 0) {
                return await ctx.reply(
                    "Usage: .joinlinks <link1> <link2> ...\n" +
                    "Paste one or more WhatsApp invite links."
                );
            }

            await ctx.reply(`🚪 Joining ${codes.length} groups...`);

            let joined = 0;
            let failed = 0;
            const failedLinks = [];

            for (const code of codes) {
                try {
                    await sock.groupAcceptInvite(code);
                    joined++;
                    await new Promise(r => setTimeout(r, 1500));
                } catch (e) {
                    failed++;
                    failedLinks.push(`https://chat.whatsapp.com/${code} — ${e.message}`);
                }
            }

            let reply = `✅ Join complete.\nJoined: ${joined}\nFailed: ${failed}`;
            if (failedLinks.length > 0) {
                reply += `\n\n*Failed links:*\n${failedLinks.join("\n")}`;
            }

            await ctx.reply(reply);

        } catch (e) {
            console.error("[invjoin]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};