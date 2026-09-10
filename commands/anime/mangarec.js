module.exports = {
    name: "mangarec",
    aliases: ["mangarecommend", "mangarecommendation"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        try {
            // Get top-rated manga as recommendations
            const apiUrl = "https://api.jikan.moe/v4/top/manga?limit=10&sfw=true";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.data?.length)
                return await ctx.reply(ctx.format.info("Could not fetch manga recommendations. Try again later."));

            const rows = res.data.map((m, i) => {
                const name = m.title_english || m.title || `Rank ${i + 1}`;
                const score = m.score ? `⭐ ${m.score}` : "N/A";
                const type = m.type || "Manga";
                return {
                    title: `${i + 1}. ${name.length > 40 ? name.slice(0, 37) + "..." : name}`,
                    description: `${score} • ${type} • ${m.chapters || "??"} chapters`,
                    rowId: `${prefix}mangasearch ${m.title}`
                };
            });

            await ctx.reply({
                text: `📚 *TOP MANGA RECOMMENDATIONS*\n\n` +
                    `Here are the top-rated manga of all time.\n\n` +
                    `_Tap to select a manga for details_`,
                footer: "Moonson Bot • Powered by MyAnimeList",
                buttonText: "📚 Select Manga",
                sections: [{
                    title: "Top Manga",
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
