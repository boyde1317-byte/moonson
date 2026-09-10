function reduceToSingleDigit(num) {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = String(num).split("").reduce((sum, d) => sum + Number(d), 0);
    }
    return num;
}

const LIFE_PATH_MEANINGS = {
    1: { title: "The Leader", desc: "Independent, ambitious, and pioneering. You're a natural-born leader who likes to blaze new trails." },
    2: { title: "The Peacemaker", desc: "Diplomatic, sensitive, and cooperative. You excel at partnerships and bringing people together." },
    3: { title: "The Creator", desc: "Expressive, creative, and social. You have a gift for communication and artistic endeavors." },
    4: { title: "The Builder", desc: "Practical, disciplined, and hardworking. You create solid foundations and value stability." },
    5: { title: "The Adventurer", desc: "Free-spirited, adaptable, and curious. You crave change and thrive on new experiences." },
    6: { title: "The Nurturer", desc: "Caring, responsible, and protective. You're devoted to family and helping others." },
    7: { title: "The Seeker", desc: "Analytical, spiritual, and introspective. You seek knowledge and deeper meaning in life." },
    8: { title: "The Powerhouse", desc: "Ambitious, confident, and business-minded. You're destined for material success and leadership." },
    9: { title: "The Humanitarian", desc: "Compassionate, idealistic, and generous. You're driven by a desire to make the world better." },
    11: { title: "The Visionary (Master)", desc: "Intuitive, inspirational, and spiritually aware. A master number with potential for great influence." },
    22: { title: "The Master Builder (Master)", desc: "Practical visionary. You can turn big dreams into reality and create lasting impact." },
    33: { title: "The Master Teacher (Master)", desc: "Compassionate healer and teacher. A rare master number of selfless service." }
};

module.exports = {
    name: "numerology",
    aliases: ["lifepath", "lifepathnumber"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "15-03-1990")
            );

        const parts = input.split(/[-\/.]/).map(Number);
        if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2])
            return await ctx.reply(ctx.format.info("Use format: DD-MM-YYYY (e.g. 15-03-1990)"));

        const [day, month, year] = parts;

        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100)
            return await ctx.reply(ctx.format.info("Invalid date. Use DD-MM-YYYY format."));

        // Calculate life path number
        const sum = day + month + year;
        const lifePath = reduceToSingleDigit(sum);
        const meaning = LIFE_PATH_MEANINGS[lifePath] || LIFE_PATH_MEANINGS[1];

        const caption =
            "🔢 *NUMEROLOGY*\n\n" +
            `❯ *Birth Date*: ${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}\n` +
            `❯ *Life Path Number*: ${lifePath}\n` +
            `❯ *Archetype*: ${meaning.title}\n\n` +
            `📖 *Meaning*\n${meaning.desc}\n\n` +
            `🔮 ${ctx.format.bold("Your life path revealed")}`;

        await ctx.reply(caption);
    }
};
