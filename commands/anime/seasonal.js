module.exports = {
    name: "seasonal",
    aliases: ["thisseason", "animeseason"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            const apiUrl = "https://api.jikan.moe/v4/seasons/now?limit=15&sfw=true";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.data?.length)
                return await ctx.reply(ctx.format.info("Could not fetch seasonal anime. Try again later."));

            const rows = res.data.slice(0, 10).map((a, i) => {
                const name = a.title_english || a.title || `Anime ${i + 1}`;
                const score = a.score ? `⭐ ${a.score}` : "No score yet";
                const type = a.type || "TV";
                return {
                    title: `${i + 1}. ${name.length > 40 ? name.slice(0, 37) + "..." : name}`,
                    description: `${score} • ${type}`,
                    rowId: `${prefix}animesearch ${a.title}`
                };
            });

            // Get season name
            const season = res.data[0]?.season || "Current";
            const year = res.data[0]?.year || new Date().getFullYear();

            await ctx.reply({
                text: `🌸 *${season.toUpperCase()} ${year} ANIME*\n\n` +
                    `Here are the top ${rows.length} anime airing this season.\n\n` +
                    `_Tap to select an anime for details_`,
                footer: "Moonson Bot • Powered by MyAnimeList",
                buttonText: "🌸 Select Anime",
                sections: [{
                    title: `${season} ${year}`,
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
