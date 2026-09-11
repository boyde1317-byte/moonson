module.exports = {
    name: "nsfwblowjob",
    aliases: ["nbj", "nsbj"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            const apiUrl = "https://api.purrbot.site/v2/img/nsfw/blowjob/gif";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.link)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            await ctx.reply({
                image: { url: res.link },
                caption: "🔞 *NSFW Blowjob*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwblowjob"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
