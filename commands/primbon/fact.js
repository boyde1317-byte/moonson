module.exports = {
    name: "fact",
    aliases: ["randomfact", "funfact", "uselessfact"],
    category: "primbon",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        try {
            const apiUrl = "https://api.popcat.xyz/fact";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.fact)
                return await ctx.reply(ctx.format.info("Could not fetch a fact right now. Try again later."));

            await ctx.reply(
                `💡 *DID YOU KNOW?*\n\n${res.fact}\n\n` +
                `🧠 ${ctx.format.bold("Random Fact")}`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
