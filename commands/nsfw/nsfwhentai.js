module.exports = {
    name: "nsfwhentai",
    aliases: ["nhentai", "nshentai"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            // Try purrbot anal endpoint as hentai
            const apiUrl = "https://purrbot.site/api/img/nsfw/hentai";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.link && !res?.url)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            const imageUrl = res.link || res.url;

            await ctx.reply({
                image: { url: imageUrl },
                caption: "🔞 *NSFW Hentai*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwhentai"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
