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

        // Pool of all NSFW endpoints across APIs
        const waifuPicsCategories = ["waifu", "neko", "blowjob", "trap"];
        const purrbotCategories = ["anal", "blowjob", "cum", "fuck", "lesbian", "spank", "threesome_gif", "pussy", "boobs", "hentai"];

        try {
            // Randomly pick an API and category
            const useWaifuPics = Math.random() < 0.4;

            let imageUrl = null;
            let label = "Random NSFW";

            if (useWaifuPics) {
                const cat = waifuPicsCategories[Math.floor(Math.random() * waifuPicsCategories.length)];
                const apiUrl = "https://api.waifu.pics/nsfw/" + cat;
                const { data: res } = await ctx.request.get(apiUrl);
                if (res?.url) {
                    imageUrl = res.url;
                    label = "NSFW " + cat.charAt(0).toUpperCase() + cat.slice(1);
                }
            }

            // Fallback to purrbot
            if (!imageUrl) {
                const cat = purrbotCategories[Math.floor(Math.random() * purrbotCategories.length)];
                const apiUrl = "https://purrbot.site/api/img/nsfw/" + cat;
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
