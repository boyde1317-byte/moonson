module.exports = {
    name: "text2sticker",
    aliases: ["ttp", "textsticker", "tts"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Hello World")}\n` +
                ctx.format.generateNotes([
                    "Convert text into a WhatsApp sticker",
                    "Maximum 100 characters"
                ])
            );

        if (input.length > 100)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 100 characters."));

        try {
            // Use siputzx text-to-picture API
            const imageUrl = ctx.api.createUrl("siputzx", "/api/canvas/ttp", { text: input });

            // Download the image and convert to sticker
            const response = await ctx.request.get(imageUrl, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data);

            await ctx.reply({
                sticker: buffer
            }, {
                pack: config.sticker.packname,
                author: config.sticker.author
            });
        } catch (error) {
            // Fallback: try attp (animated text sticker)
            try {
                const fallbackUrl = ctx.api.createUrl("nexray", "/maker/attp", { text: input });
                await ctx.reply({
                    sticker: { url: fallbackUrl }
                }, {
                    pack: config.sticker.packname,
                    author: config.sticker.author
                });
            } catch (err) {
                await ctx.helper.handleError(ctx, error, true);
            }
        }
    }
};
