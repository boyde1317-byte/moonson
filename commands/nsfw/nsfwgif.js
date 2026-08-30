module.exports = {
    name: "nsfwgif",
    aliases: ["ngif", "nsgif"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            const apiUrl = "https://purrbot.site/api/img/nsfw/fuck";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.link && !res?.error)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            if (res?.error || !res?.link)
                return await ctx.reply(ctx.format.info("This category is temporarily unavailable. Try again later."));

            await ctx.reply({
                image: { url: res.link },
                caption: "🔞 *NSFW Random NSFW GIF*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwgif"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
