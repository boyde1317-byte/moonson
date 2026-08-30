const ZODIAC_SIGNS = [
    { name: "Aries", emoji: "♈", dates: "Mar 21 - Apr 19" },
    { name: "Taurus", emoji: "♉", dates: "Apr 20 - May 20" },
    { name: "Gemini", emoji: "♊", dates: "May 21 - Jun 20" },
    { name: "Cancer", emoji: "♋", dates: "Jun 21 - Jul 22" },
    { name: "Leo", emoji: "♌", dates: "Jul 23 - Aug 22" },
    { name: "Virgo", emoji: "♍", dates: "Aug 23 - Sep 22" },
    { name: "Libra", emoji: "♎", dates: "Sep 23 - Oct 22" },
    { name: "Scorpio", emoji: "♏", dates: "Oct 23 - Nov 21" },
    { name: "Sagittarius", emoji: "♐", dates: "Nov 22 - Dec 21" },
    { name: "Capricorn", emoji: "♑", dates: "Dec 22 - Jan 19" },
    { name: "Aquarius", emoji: "♒", dates: "Jan 20 - Feb 18" },
    { name: "Pisces", emoji: "♓", dates: "Feb 19 - Mar 20" }
];

module.exports = {
    name: "horoscope",
    aliases: ["horo", "zodiachoro"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = (ctx.text || "").toLowerCase().trim();

        if (!input) {
            const buttons = ZODIAC_SIGNS.map(s => ({
                text: `${s.emoji} ${s.name}`,
                id: `${ctx.used.prefix}${ctx.used.command} ${s.name}`
            }));
            return await ctx.reply({
                header: "🔮 *HOROSCOPE*",
                content: "Tap your zodiac sign to get today's horoscope!",
                footer: config.msg.footer || "",
                buttons
            });
        }

        const sign = ZODIAC_SIGNS.find(s => s.name.toLowerCase() === input) ||
                     ZODIAC_SIGNS.find(s => s.name.toLowerCase().startsWith(input));

        if (!sign)
            return await ctx.reply(ctx.format.info(
                'Unknown sign "' + input + '".\nValid signs: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces'
            ));

        try {
            const apiUrl = "https://ohmanda.com/api/horoscope/" + sign.name.toLowerCase() + "/";
            const { data: res } = await ctx.request.get(apiUrl, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            if (!res?.horoscope)
                return await ctx.reply(ctx.format.info("Could not fetch horoscope right now. Try again later."));

            const date = res.date || new Date().toISOString().slice(0, 10);

            const caption =
                `${sign.emoji} *${sign.name.toUpperCase()}*\n` +
                `📅 ${date}\n` +
                `${sign.dates}\n\n` +
                `${res.horoscope}\n\n` +
                `🔮 ${ctx.format.bold("Daily Horoscope")}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
