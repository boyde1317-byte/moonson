module.exports = {
    name: "imgpooh",
    aliases: ["poohmeme", "poohbear"],
    category: "image",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "kids these days|kids in my day")
            );

        const parts = input.split("|").map(s => s.trim());
        if (parts.length < 2)
            return await ctx.reply(ctx.format.info("Provide two texts separated by | (e.g. smart kids | genius kids)"));

        try {
            const apiUrl = "https://api.popcat.xyz/pooh?text1=" + encodeURIComponent(parts[0]) + "&text2=" + encodeURIComponent(parts[1]);
            await ctx.reply({
                image: { url: apiUrl },
                caption: `🐻 *POOH MEME*`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
