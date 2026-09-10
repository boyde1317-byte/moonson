module.exports = {
    name: "animequote",
    aliases: ["aniquote", "quote"],
    category: "anime",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        try {
            let apiUrl;

            if (input) {
                // Search by character name
                apiUrl = `https://animechan.io/api/v1/quotes/character?name=${encodeURIComponent(input)}`;
            } else {
                // Random quote
                apiUrl = "https://animechan.io/api/v1/quotes/random";
            }

            const { data: res } = await ctx.request.get(apiUrl);

            // Handle response - could be single object or array
            const quote = Array.isArray(res?.data) ? res.data[0] : res?.data;

            if (!quote)
                return await ctx.reply(ctx.format.info(
                    input ? `No quotes found for "${input}".` : "Could not fetch a quote. Try again later."
                ));

            const caption =
                `💬 *ANIME QUOTE*\n\n` +
                `"${quote.quote}"\n\n` +
                `— *${quote.character}*\n` +
                `From: ${quote.anime}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
