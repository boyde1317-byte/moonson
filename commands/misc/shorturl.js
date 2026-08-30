module.exports = {
    name: "shorturl",
    aliases: ["shortlink", "urlshort"],
    category: "misc",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://example.com/very/long/url")}\n` +
                ctx.format.generateNotes(["Shorten any URL using is.gd"])
            );

        if (!ctx.helper.isUrl(url))
            return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        try {
            // is.gd API — free, no key needed
            const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
            const response = await ctx.request.get(apiUrl);
            const data = response.data;

            if (data.shorturl) {
                await ctx.reply(
                    `🔗 *URL SHORTENER*\n\n` +
                    `❯ Original: ${url}\n` +
                    `❯ Shortened: ${data.shorturl}`
                );
            } else if (data.errormessage) {
                await ctx.reply(ctx.format.info(`Error: ${data.errormessage}`));
            } else {
                await ctx.reply(ctx.format.info("Could not shorten the URL. Please try again."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
