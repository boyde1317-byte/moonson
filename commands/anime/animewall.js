module.exports = {
    name: "animewall",
    aliases: ["animewallpaper", "anwall"],
    category: "anime",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            // waifu.pics shut down — use nekos.life wallpaper endpoint
            const apiUrl = "https://nekos.life/api/v2/img/wallpaper";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.url)
                return await ctx.reply(ctx.format.info("Could not fetch wallpaper. Try again later."));

            await ctx.reply({
                image: { url: res.url },
                caption: `🎨 *Anime Wallpaper*\n\n_Tap below for another wallpaper_`,
                buttons: [{
                    text: "🔄 New Wallpaper",
                    id: `${prefix}animewall`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
