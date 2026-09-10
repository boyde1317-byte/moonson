module.exports = {
    name: "animerelated",
    aliases: ["animerecommend", "related"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;
        const prefix = ctx.used.prefix;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "Naruto")
            );

        try {
            // Search for the anime first
            const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(input)}&limit=1&sfw=true`;
            const { data: searchRes } = await ctx.request.get(searchUrl);

            if (!searchRes?.data?.length)
                return await ctx.reply(ctx.format.info(`No anime found for "${input}".`));

            const anime = searchRes.data[0];

            // Get recommendations for this anime
            const recUrl = `https://api.jikan.moe/v4/anime/${anime.mal_id}/recommendations`;
            const { data: recRes } = await ctx.request.get(recUrl);

            if (!recRes?.data?.length)
                return await ctx.reply(ctx.format.info(`No recommendations found for "${anime.title}".`));

            const rows = recRes.data.slice(0, 10).map((r, i) => {
                const entry = r.entry;
                const name = entry.title_english || entry.title || `Rec ${i + 1}`;
                const score = entry.score ? `⭐ ${entry.score}` : "N/A";
                return {
                    title: `${i + 1}. ${name.length > 40 ? name.slice(0, 37) + "..." : name}`,
                    description: `${score} • ${entry.type || "TV"}`,
                    rowId: `${prefix}animesearch ${entry.title}`
                };
            });

            await ctx.reply({
                text: `🎯 *ANIME RECOMMENDATIONS*\n\n` +
                    `Based on: ${ctx.format.bold(anime.title_english || anime.title)}\n` +
                    `Results: ${rows.length} recommendations\n\n` +
                    `_Tap to select an anime for details_`,
                footer: "Moonson Bot • Powered by MyAnimeList",
                buttonText: "🎯 Select Anime",
                sections: [{
                    title: "Recommendations",
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
