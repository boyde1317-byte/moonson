module.exports = {
    name: "quotecard",
    aliases: ["qcard", "quoteimg"],
    category: "maker",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "The best way to predict the future is to invent it|Alan Kay")}\n` +
                ctx.format.generateNotes([
                    "Create a beautiful quote card image",
                    "Format: quote | author (author is optional)"
                ])
            );

        try {
            let [quote, author] = input.split("|").map(s => s?.trim());
            if (!author) author = "Unknown";

            if (quote.length > 200)
                return await ctx.reply(ctx.format.info("Quote too long! Maximum 200 characters."));

            // Try nexray quote card endpoint
            const imageUrl = ctx.api.createUrl("nexray", "/maker/quote", {
                text: quote,
                author: author
            });

            await ctx.reply({
                image: { url: imageUrl },
                caption:
                    `💬 *QUOTE CARD*\n\n` +
                    `❯ ${ctx.format.bold("Quote")}: "${quote}"\n` +
                    `❯ ${ctx.format.bold("Author")}: ${author}`,
                buttons: [
                    { text: "Make Another", id: `${ctx.used.prefix}${ctx.used.command}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
