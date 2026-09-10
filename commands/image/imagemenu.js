module.exports = {
    name: "imagemenu",
    aliases: ["image"],
    category: "image",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        const caption =
            "🎨 *IMAGE MENU*\n\n" +
            "*Meme Generators*\n\n" +
            "❯ " + ctx.format.inlineCode(prefix + "wanted [reply image]") + " — Wanted poster\n" +
            "❯ " + ctx.format.inlineCode(prefix + "burn [reply image]") + " — Burn effect\n" +
            "❯ " + ctx.format.inlineCode(prefix + "alert <text>") + " — Emergency alert\n" +
            "❯ " + ctx.format.inlineCode(prefix + "pooh <text1|text2>") + " — Pooh meme\n" +
            "❯ " + ctx.format.inlineCode(prefix + "drake <text1|text2>") + " — Drake meme\n" +
            "❯ " + ctx.format.inlineCode(prefix + "biden <text1|text2>") + " — Biden meme\n" +
            "❯ " + ctx.format.inlineCode(prefix + "sadcat <text1|text2>") + " — Sad cat meme\n" +
            "❯ " + ctx.format.inlineCode(prefix + "memegen [reply image] <text>") + " — Caption an image\n\n" +
            "_Reply to an image or send one with the command_";

        await ctx.reply(caption);
    }
};
