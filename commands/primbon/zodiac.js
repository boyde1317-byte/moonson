function getZodiac(month, day) {
    const dates = [
        { sign: "Capricorn", emoji: "♑", start: [12, 22], end: [1, 19] },
        { sign: "Aquarius", emoji: "♒", start: [1, 20], end: [2, 18] },
        { sign: "Pisces", emoji: "♓", start: [2, 19], end: [3, 20] },
        { sign: "Aries", emoji: "♈", start: [3, 21], end: [4, 19] },
        { sign: "Taurus", emoji: "♉", start: [4, 20], end: [5, 20] },
        { sign: "Gemini", emoji: "♊", start: [5, 21], end: [6, 20] },
        { sign: "Cancer", emoji: "♋", start: [6, 21], end: [7, 22] },
        { sign: "Leo", emoji: "♌", start: [7, 23], end: [8, 22] },
        { sign: "Virgo", emoji: "♍", start: [8, 23], end: [9, 22] },
        { sign: "Libra", emoji: "♎", start: [9, 23], end: [10, 22] },
        { sign: "Scorpio", emoji: "♏", start: [10, 23], end: [11, 21] },
        { sign: "Sagittarius", emoji: "♐", start: [11, 22], end: [12, 21] }
    ];

    for (const z of dates) {
        const [sm, sd] = z.start;
        const [em, ed] = z.end;
        if (sm === em) {
            if (month === sm && day >= sd && day <= ed) return z;
        } else {
            if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
        }
    }
    return dates[0]; // Capricorn wraps
}

const ZODIAC_INFO = {
    Aries: { element: "Fire", planet: "Mars", traits: "Confident, determined, enthusiastic, impulsive, courageous" },
    Taurus: { element: "Earth", planet: "Venus", traits: "Reliable, patient, practical, devoted, stubborn" },
    Gemini: { element: "Air", planet: "Mercury", traits: "Curious, adaptable, witty, restless, sociable" },
    Cancer: { element: "Water", planet: "Moon", traits: "Loyal, emotional, sympathetic, intuitive, protective" },
    Leo: { element: "Fire", planet: "Sun", traits: "Creative, passionate, generous, warm-hearted, arrogant" },
    Virgo: { element: "Earth", planet: "Mercury", traits: "Analytical, kind, hardworking, practical, critical" },
    Libra: { element: "Air", planet: "Venus", traits: "Diplomatic, fair, social, gracious, indecisive" },
    Scorpio: { element: "Water", planet: "Pluto", traits: "Passionate, resourceful, brave, stubborn, jealous" },
    Sagittarius: { element: "Fire", planet: "Jupiter", traits: "Generous, idealistic, humorous, free-spirited, impatient" },
    Capricorn: { element: "Earth", planet: "Saturn", traits: "Responsible, disciplined, self-controlled, serious" },
    Aquarius: { element: "Air", planet: "Uranus", traits: "Progressive, original, independent, aloof, humanitarian" },
    Pisces: { element: "Water", planet: "Neptune", traits: "Compassionate, artistic, intuitive, gentle, fearful" }
};

module.exports = {
    name: "zodiac",
    aliases: ["zodiacsign", "starsign"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "15-03")
            );

        const parts = input.split(/[-\/.]/).map(Number);
        if (parts.length < 2 || !parts[0] || !parts[1])
            return await ctx.reply(ctx.format.info("Use the format: DD-MM (e.g. 15-03)"));

        const day = parts[0];
        const month = parts[1];

        if (month < 1 || month > 12 || day < 1 || day > 31)
            return await ctx.reply(ctx.format.info("Invalid date. Use DD-MM format (e.g. 15-03)"));

        const zodiac = getZodiac(month, day);
        const info = ZODIAC_INFO[zodiac.sign];

        const caption =
            `${zodiac.emoji} *${zodiac.sign.toUpperCase()}*\n\n` +
            `❯ *Element*: ${info.element}\n` +
            `❯ *Ruling Planet*: ${info.planet}\n` +
            `❯ *Traits*: ${info.traits}\n\n` +
            `🔮 ${ctx.format.bold("Your zodiac sign")}`;

        await ctx.reply(caption);
    }
};
