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
            // Use nekos.fun API for neko images
            const apiUrl = "https://nekos.fun/api/neko";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.image && !res?.url)
                return await ctx.reply(ctx.format.info("Could not fetch neko image. Try again later."));

            const imageUrl = res.image || res.url;

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
