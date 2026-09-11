module.exports = {
    name: "neko",
    aliases: ["catgirl"],
    category: "anime",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            // nekos.fun shut down — use nekos.best
            const apiUrl = "https://nekos.best/api/v2/neko";
            const { data: res } = await ctx.request.get(apiUrl);

            const imageUrl = res?.results?.[0]?.url || res?.image || res?.url;

            if (!imageUrl)
                return await ctx.reply(ctx.format.info("Could not fetch neko image. Try again later."));

            await ctx.reply({
                image: { url: imageUrl },
                caption: `🐱 *Neko*\n\nWant another? Tap below!`,
                buttons: [{
                    text: "🔄 Get Another",
                    id: `${prefix}neko`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
