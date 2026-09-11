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
            // animechan.io moved to api.animechan.io/v1 (new response shape)
            let apiUrl;

            if (input) {
                // Random quote by character name
                apiUrl = `https://api.animechan.io/v1/quotes/random?character=${encodeURIComponent(input)}`;
            } else {
                // Random quote
                apiUrl = "https://api.animechan.io/v1/quotes/random";
            }

            const { data: res } = await ctx.request.get(apiUrl);

            const quote = res?.data;

            if (!quote?.content)
                return await ctx.reply(ctx.format.info(
                    input ? `No quotes found for "${input}".` : "Could not fetch a quote. Try again later."
                ));

            const caption =
                `💬 *ANIME QUOTE*\n\n` +
                `"${quote.content}"\n\n` +
                `— *${quote.character?.name || "Unknown"}*\n` +
                `From: ${quote.anime?.name || "Unknown"}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
