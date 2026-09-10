module.exports = {
    name: "nsfwboobs",
    aliases: ["nboobs", "nsboobs"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            const apiUrl = "https://purrbot.site/api/img/nsfw/boobs";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.link && !res?.error)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            if (res?.error || !res?.link)
                return await ctx.reply(ctx.format.info("This category is temporarily unavailable. Try again later."));

            await ctx.reply({
                image: { url: res.link },
                caption: "🔞 *NSFW Boobs*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwboobs"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
