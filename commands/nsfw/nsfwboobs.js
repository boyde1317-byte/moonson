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
            let imageUrl = null;

            // Primary: waifu.im "oppai" (purrbot has no boobs category)
            try {
                const { data: res } = await ctx.request.get("https://api.waifu.im/search?included_tags=oppai&is_sfw=false&limit=1");
                const image = res?.images?.[0];
                if (image?.url) imageUrl = image.url;
            } catch {}

            // Fallback: purrbot v2 solo
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
