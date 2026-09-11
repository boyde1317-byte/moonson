module.exports = {
    name: "nsfwrandom",
    aliases: ["nsr", "nsfwrand"],
    category: "nsfw",
    permissions: {
        coin: 5,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        // waifu.pics shut down (2026) — purrbot v2 is the live source
        const purrbotCategories = ["anal", "blowjob", "cum", "fuck", "neko", "yuri", "solo", "solo_male", "pussylick", "threesome_fff", "threesome_ffm", "threesome_mmf", "yaoi"];

        try {
            let imageUrl = null;
            let label = "Random NSFW";

            // purrbot v2
            {
                const cat = purrbotCategories[Math.floor(Math.random() * purrbotCategories.length)];
                const apiUrl = "https://api.purrbot.site/v2/img/nsfw/" + cat + "/gif";
                const { data: res } = await ctx.request.get(apiUrl);
                if (res?.link) {
                    imageUrl = res.link;
                    const cleanLabel = cat.replace(/_/g, " ");
                    label = "NSFW " + cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);
                }
            }

            if (!imageUrl)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            await ctx.reply({
                image: { url: imageUrl },
                caption: "🔞 *" + label + "*\n\nTap below for another random!",
                buttons: [{
                    text: "🔄 Get Another",
                    id: prefix + "nsfwrandom"
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
