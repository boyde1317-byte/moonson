module.exports = {
    name: "primbonmenu",
    aliases: ["primbon"],
    category: "primbon",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        const caption =
            "🔮 *PRIMBON MENU*\n\n" +
            "*Divination & Fortune*\n\n" +
            "❯ " + ctx.format.inlineCode(prefix + "horoscope <sign>") + " — Daily horoscope\n" +
            "❯ " + ctx.format.inlineCode(prefix + "tarot") + " — Draw a tarot card\n" +
            "❯ " + ctx.format.inlineCode(prefix + "tarot3") + " — Three-card tarot spread\n" +
            "❯ " + ctx.format.inlineCode(prefix + "zodiac <DD-MM>") + " — Find your zodiac sign\n" +
            "❯ " + ctx.format.inlineCode(prefix + "zmatch <sign1> <sign2>") + " — Zodiac compatibility\n" +
            "❯ " + ctx.format.inlineCode(prefix + "numerology <DD-MM-YYYY>") + " — Life path number\n" +
            "❯ " + ctx.format.inlineCode(prefix + "lucky <DD-MM-YYYY>") + " — Lucky numbers\n" +
            "❯ " + ctx.format.inlineCode(prefix + "fortune") + " — Fortune cookie\n\n" +
            "*Knowledge & Trivia*\n\n" +
            "❯ " + ctx.format.inlineCode(prefix + "thisday") + " — Today in history\n" +
            "❯ " + ctx.format.inlineCode(prefix + "fact") + " — Random fun fact\n\n" +
            "_Signs: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces_";

        await ctx.reply(caption);
    }
};
