function reduceToSingleDigit(num) {
    while (num > 9 && num !== 11 && num !== 22) {
        num = String(num).split("").reduce((sum, d) => sum + Number(d), 0);
    }
    return num;
}

module.exports = {
    name: "lucky",
    aliases: ["luckynumbers", "luckynum"],
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

        // Generate lucky numbers from birthdate
        const lifePath = reduceToSingleDigit(day + month + year);
        const destiny = reduceToSingleDigit(
            String(day).split("").reduce((s, d) => s + Number(d), 0) +
            String(month).split("").reduce((s, d) => s + Number(d), 0) +
            String(year).split("").reduce((s, d) => s + Number(d), 0)
        );

        // Lucky numbers based on numerology
        const luckyNumbers = [
            lifePath,
            destiny,
            reduceToSingleDigit(lifePath * 2),
            reduceToSingleDigit(day + month),
            reduceToSingleDigit(year % 100),
            (lifePath + 9) % 10 || 9
        ];

        // Remove duplicates and sort
        const unique = [...new Set(luckyNumbers)].sort((a, b) => a - b);

        // Lucky day
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const luckyDay = days[lifePath % 7];

        // Lucky color
        const colorMap = {
            1: "Red", 2: "White", 3: "Yellow", 4: "Green",
            5: "Grey", 6: "Pink", 7: "Purple", 8: "Black",
            9: "Orange", 11: "Silver", 22: "Gold"
        };
        const luckyColor = colorMap[lifePath] || "Blue";

        const caption =
            "🍀 *LUCKY NUMBERS*\n\n" +
            `❯ *Birth Date*: ${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}\n` +
            `❯ *Lucky Numbers*: ${unique.join(", ")}\n` +
            `❯ *Lucky Day*: ${luckyDay}\n` +
            `❯ *Lucky Color*: ${luckyColor}\n\n` +
            `🔮 ${ctx.format.bold("May luck be on your side")}`;

        await ctx.reply(caption);
    }
};
