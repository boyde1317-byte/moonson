const COMPATIBILITY = {
    "Aries-Aries": "🔥 Both are fire — passionate but can clash. High energy, low patience.",
    "Aries-Taurus": "⚖️ Opposites attract. Aries is fire, Taurus is earth. Needs compromise.",
    "Aries-Gemini": "💨 Great match. Both love adventure and excitement. Dynamic duo.",
    "Aries-Cancer": "🌊 Challenging. Fire meets water. Needs understanding and patience.",
    "Aries-Leo": "🔥🔥 Perfect match. Both fire signs — passionate, loyal, and dynamic together.",
    "Aries-Virgo": "🌱 Different speeds. Aries rushes, Virgo plans. Can work with effort.",
    "Aries-Libra": "⚖️ Opposites attract. Aries is direct, Libra is diplomatic. Great balance.",
    "Aries-Scorpio": "⚡ Intense. Both are passionate and strong-willed. Power couple or clash.",
    "Aries-Sagittarius": "🏹 Excellent match. Both love freedom and adventure. Natural friends.",
    "Aries-Capricorn": "🏔️ Different approaches. Aries is impulsive, Capricorn is strategic.",
    "Aries-Aquarius": "🌟 Great match. Both are independent and unconventional. Exciting.",
    "Aries-Pisces": "🐟 Delicate balance. Fire meets water. Can be magical or overwhelming.",
    "Taurus-Taurus": "🌿 Stable and devoted. Two earth signs — comfortable, loyal, and sensual.",
    "Taurus-Gemini": "💨 Different rhythms. Taurus is slow, Gemini is quick. Needs adjustment.",
    "Taurus-Cancer": "🌙 Wonderful match. Both value home, family, and emotional security.",
    "Taurus-Leo": "🦁 Both stubborn. Needs mutual respect. Can be a power struggle.",
    "Taurus-Virgo": "🌱 Excellent match. Both earth signs — practical, devoted, and reliable.",
    "Taurus-Libra": "⚖️ Both ruled by Venus. Love beauty and harmony. Good match.",
    "Taurus-Scorpio": "⚡ Opposites attract intensely. Deep, passionate, but can be volatile.",
    "Taurus-Sagittarius": "🏹 Different lifestyles. Taurus wants stability, Sagittarius wants freedom.",
    "Taurus-Capricorn": "🏔️ Strong match. Both earth signs — ambitious, practical, and loyal.",
    "Taurus-Aquarius": "🌍 Very different. Taurus is traditional, Aquarius is unconventional.",
    "Taurus-Pisces": "🐟 Beautiful match. Both love romance, art, and emotional depth.",
    "Gemini-Gemini": "💨 Dynamic but chaotic. Two air signs — witty, restless, and fun.",
    "Gemini-Cancer": "🦀 Different emotional needs. Gemini is logical, Cancer is emotional.",
    "Gemini-Leo": "🦁 Great fun match. Both are social, outgoing, and love attention.",
    "Gemini-Virgo": "🧠 Both ruled by Mercury. Intellectual connection. Good but different.",
    "Gemini-Libra": "⚖️ Excellent match. Both air signs — social, communicative, and charming.",
    "Gemini-Scorpio": "⚡ Intense contrast. Light meets dark. Fascinating but challenging.",
    "Gemini-Sagittarius": "🏹 Perfect match. Both love freedom, adventure, and philosophy.",
    "Gemini-Capricorn": "🏔️ Different speeds. Gemini is playful, Capricorn is serious.",
    "Gemini-Aquarius": "🌟 Excellent match. Both air signs — innovative, social, and free-spirited.",
    "Gemini-Pisces": "🐟 Both are adaptable. Can be dreamy together but may lack grounding.",
    "Cancer-Cancer": "🌙 Deeply emotional. Both value home and family. nurturing but moody.",
    "Cancer-Leo": "🦁 Warm and loving. Cancer nurtures, Leo shines. Good balance.",
    "Cancer-Virgo": "🌱 Excellent match. Both are caring and devoted. Practical and nurturing.",
    "Cancer-Libra": "⚖️ Different needs. Cancer wants emotional depth, Libra wants harmony.",
    "Cancer-Scorpio": "⚡ Powerful match. Both water signs — deep, intuitive, and passionate.",
    "Cancer-Sagittarius": "🏹 Different worlds. Cancer wants home, Sagittarius wants the world.",
    "Cancer-Capricorn": "🏔️ Opposites attract. Cancer is emotional, Capricorn is practical. Balanced.",
    "Cancer-Aquarius": "🌍 Very different. Cancer is emotional, Aquarius is detached.",
    "Cancer-Pisces": "🐟 Soulmates. Both water signs — deep, romantic, and empathetic.",
    "Leo-Leo": "🦁🔥 Two kings. Dramatic, passionate, and loyal. Just don't compete.",
    "Leo-Virgo": "🌱 Different styles. Leo is bold, Virgo is modest. Can complement each other.",
    "Leo-Libra": "⚖️ Great match. Both love beauty, socializing, and romance.",
    "Leo-Scorpio": "⚡ Power couple. Both are passionate and intense. Can be explosive.",
    "Leo-Sagittarius": "🏹 Fantastic match. Both fire signs — adventurous, fun, and passionate.",
    "Leo-Capricorn": "🏔️ Both ambitious. Leo is flamboyant, Capricorn is reserved. Respect needed.",
    "Leo-Aquarius": "🌟 Opposites attract. Leo is warm, Aquarius is cool. Dynamic and exciting.",
    "Leo-Pisces": "🐟 Gentle balance. Leo is bold, Pisces is soft. Can be magical.",
    "Virgo-Virgo": "🌱 Perfect order. Two earth signs — practical, devoted, and detailed.",
    "Virgo-Libra": "⚖️ Good match. Both appreciate refinement and beauty. Balanced.",
    "Virgo-Scorpio": "⚡ Deep connection. Both are analytical and intense. Trusting and loyal.",
    "Virgo-Sagittarius": "🏹 Different vibes. Virgo is precise, Sagittarius is free. Needs work.",
    "Virgo-Capricorn": "🏔️ Excellent match. Both earth signs — practical, ambitious, and loyal.",
    "Virgo-Aquarius": "🌍 Intellectual match. Both are analytical but emotionally different.",
    "Virgo-Pisces": "🐟 Opposites attract. Virgo is practical, Pisces is dreamy. Perfect balance.",
    "Libra-Libra": "⚖️ Harmonious. Both love balance, beauty, and peace. May avoid conflict.",
    "Libra-Scorpio": "⚡ Intense contrast. Libra is light, Scorpio is deep. Fascinating.",
    "Libra-Sagittarius": "🏹 Great match. Both are social, outgoing, and love adventure.",
    "Libra-Capricorn": "🏔️ Different priorities. Libra loves beauty, Capricorn loves success.",
    "Libra-Aquarius": "🌟 Excellent match. Both air signs — social, intellectual, and fair.",
    "Libra-Pisces": "🐟 Romantic and dreamy. Both love beauty and harmony. Gentle match.",
    "Scorpio-Scorpio": "⚡ Intense. Two scorpions — passionate, loyal, but can sting each other.",
    "Scorpio-Sagittarius": "🏹 Different energies. Scorpio is deep, Sagittarius is free. Challenging.",
    "Scorpio-Capricorn": "🏔️ Powerful match. Both are ambitious, intense, and loyal.",
    "Scorpio-Aquarius": "🌍 Very different. Scorpio is emotional, Aquarius is detached.",
    "Scorpio-Pisces": "🐟 Soulmates. Both water signs — deep, passionate, and intuitive.",
    "Sagittarius-Sagittarius": "🏹 Adventurous duo. Both love freedom and fun. Never boring.",
    "Sagittarius-Capricorn": "🏔️ Different values. Sagittarius is free, Capricorn is disciplined.",
    "Sagittarius-Aquarius": "🌟 Excellent match. Both love freedom, adventure, and ideas.",
    "Sagittarius-Pisces": "🐟 Different depths. Sagittarius is fire, Pisces is water. Magical or hard.",
    "Capricorn-Capricorn": "🏔️ Power couple. Both are ambitious, practical, and devoted.",
    "Capricorn-Aquarius": "🌍 Different visions. Capricorn is traditional, Aquarius is radical.",
    "Capricorn-Pisces": "🐟 Complementary. Capricorn is grounded, Pisces is dreamy. Beautiful.",
    "Aquarius-Aquarius": "🌟 Two visionaries. Innovative, independent, and unconventional.",
    "Aquarius-Pisces": "🐟 Gentle and dreamy. Both are compassionate. Can be magical.",
    "Pisces-Pisces": "🐟 Two dreamers. Deep, romantic, and intuitive. May lack grounding."
};

module.exports = {
    name: "zmatch",
    aliases: ["zodiacmatch", "zodiaccompatibility", "compatibility"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "leo aries")
            );

        const parts = input.toLowerCase().trim().split(/\s+/);
        if (parts.length < 2)
            return await ctx.reply(ctx.format.info("Provide two zodiac signs. e.g. " + ctx.used.prefix + ctx.used.command + " leo aries"));

        // Normalize sign names
        const signMap = {
            aries: "Aries", taurus: "Taurus", gemini: "Gemini",
            cancer: "Cancer", leo: "Leo", virgo: "Virgo",
            libra: "Libra", scorpio: "Scorpio", sagittarius: "Sagittarius",
            capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces"
        };

        const sign1 = signMap[parts[0]];
        const sign2 = signMap[parts[1]];

        if (!sign1 || !sign2)
            return await ctx.reply(ctx.format.info("Invalid signs. Use: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces"));

        // Look up compatibility (try both orderings)
        const key1 = `${sign1}-${sign2}`;
        const key2 = `${sign2}-${sign1}`;
        const result = COMPATIBILITY[key1] || COMPATIBILITY[key2];

        if (!result)
            return await ctx.reply(ctx.format.info("Compatibility data not found for this combination."));

        const caption =
            "❤️ *ZODIAC COMPATIBILITY*\n\n" +
            `${sign1} × ${sign2}\n\n` +
            result + "\n\n" +
            `🔮 ${ctx.format.bold("Love & Compatibility")}`;

        await ctx.reply(caption);
    }
};
