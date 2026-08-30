module.exports = {
    name: "imgsadcat",
    aliases: ["sadcatmeme", "sadcat"],
    category: "image",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "when you drop your ice cream|sad cat hours")
            );

        const parts = input.split("|").map(s => s.trim());
        if (parts.length < 2)
            return await ctx.reply(ctx.format.info("Provide two texts separated by | (e.g. sad | sadder)"));

        try {
            const apiUrl = "https://api.popcat.xyz/sadcat?text1=" + encodeURIComponent(parts[0]) + "&text2=" + encodeURIComponent(parts[1]);
            await ctx.reply({
                image: { url: apiUrl },
                caption: `😿 *SAD CAT MEME*`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
