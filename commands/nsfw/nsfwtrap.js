module.exports = {
    name: "nsfwtrap",
    aliases: ["ntrap", "nstrap"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            // waifu.pics shut down; no live trap-specific API exists.
            // Closest live category: purrbot solo_male
            const apiUrl = "https://api.purrbot.site/v2/img/nsfw/solo_male/gif";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.link)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            await ctx.reply({
                image: { url: res.link },
                caption: "🔞 *NSFW Trap*\n\nTap below for another!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwtrap"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
