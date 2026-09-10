module.exports = {
    name: "emojimix",
    aliases: ["emix", "emojimerge", "mixemoji"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input || input.length < 2)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "😂+🥳")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "😂 🥳")}\n` +
                ctx.format.generateNotes([
                    "Mix two emojis into one",
                    "Use + or space between emojis"
                ])
            );

        try {
            // Parse two emojis from input
            let emoji1, emoji2;
            const plusMatch = input.match(/(\p{Extended_Pictographic})\s*\+\s*(\p{Extended_Pictographic})/u);
            const spaceMatch = input.match(/(\p{Extended_Pictographic})\s+(\p{Extended_Pictographic})/u);
            const anyMatch = input.match(/(\p{Extended_Pictographic})/gu);

            if (plusMatch) {
                emoji1 = plusMatch[1];
                emoji2 = plusMatch[2];
            } else if (spaceMatch) {
                emoji1 = spaceMatch[1];
                emoji2 = spaceMatch[2];
            } else if (anyMatch && anyMatch.length >= 2) {
                emoji1 = anyMatch[0];
                emoji2 = anyMatch[1];
            } else {
                return await ctx.reply(ctx.format.info("Please provide two emojis separated by + or space!"));
            }

            // Try emojo mix API — free, no key
            const mixUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuXLEmJ2B1B0au1F3G1N7Y0L2KJ2M&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v6&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

            const response = await ctx.request.get(mixUrl).catch(() => null);

            if (response?.data?.results?.length > 0) {
                const imageUrl = response.data.results[0].url;
                await ctx.reply({
                    sticker: { url: imageUrl }
                }, {
                    pack: config.sticker.packname,
                    author: config.sticker.author
                });
            } else {
                // Fallback: try nexray emojimix
                try {
                    const fallbackUrl = ctx.api.createUrl("nexray", "/maker/emojimix", {
                        emoji1,
                        emoji2
                    });
                    await ctx.reply({
                        sticker: { url: fallbackUrl }
                    }, {
                        pack: config.sticker.packname,
                        author: config.sticker.author
                    });
                } catch (err) {
                    return await ctx.reply(ctx.format.info("Could not mix these emojis. Try a different combination!"));
                }
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
