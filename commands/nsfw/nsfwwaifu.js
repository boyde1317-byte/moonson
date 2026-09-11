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
            let imageUrl = null;

            // Primary: waifu.im (not reachable from every network — see fallback)
            try {
                const { data: res } = await ctx.request.get("https://api.waifu.im/search?included_tags=waifu&is_sfw=false&limit=1");
                const image = res?.images?.[0];
                if (image?.url) imageUrl = image.url;
            } catch {}

            // Fallback: purrbot v2
            if (!imageUrl) {
                try {
                    const { data: res } = await ctx.request.get("https://api.purrbot.site/v2/img/nsfw/solo/gif");
                    if (res?.link) imageUrl = res.link;
                } catch {}
            }

            if (!imageUrl)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            await ctx.reply({
                image: { url: imageUrl },
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
