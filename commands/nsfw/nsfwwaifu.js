module.exports = {
    name: "nsfwwaifu",
    aliases: ["nwaifu", "nswaifu"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            const apiUrl = "https://api.waifu.pics/nsfw/waifu";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.url)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            await ctx.reply({
                image: { url: res.url },
                caption: "🔞 *NSFW Waifu*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwwaifu"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
