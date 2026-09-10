module.exports = {
    name: "topanime",
    aliases: ["topani", "animerank"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;
        const input = ctx.text;

        // Determine category
        let filter = "";
        let title = "Top Anime";

        if (input) {
            const lower = input.toLowerCase();
            if (lower.includes("airing")) { filter = "&filter=airing"; title = "Top Airing Anime"; }
            else if (lower.includes("movie")) { filter = "&type=movie"; title = "Top Anime Movies"; }
            else if (lower.includes("ova")) { filter = "&type=ova"; title = "Top OVA Anime"; }
            else if (lower.includes("special")) { filter = "&type=special"; title = "Top Special Anime"; }
            else if (lower.includes("tv")) { filter = "&type=tv"; title = "Top TV Anime"; }
        }

        try {
            const apiUrl = `https://api.jikan.moe/v4/top/anime?limit=10${filter}`;
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.data?.length)
                return await ctx.reply(ctx.format.info("Could not fetch top anime. Try again later."));

            const rows = res.data.map((a, i) => {
                const name = a.title_english || a.title || `Rank ${i + 1}`;
                const score = a.score ? `${a.score}` : "N/A";
                const year = a.year || a.aired?.from?.slice(0, 4) || "";
                return {
                    title: `${i + 1}. ${name.length > 40 ? name.slice(0, 37) + "..." : name}`,
                    description: `⭐ ${score}${year ? ` • ${year}` : ""} • ${a.type || "TV"}`,
                    rowId: `${prefix}animesearch ${a.title}`
                };
            });

            await ctx.reply({
                text: `🏆 *${title}*\n\n_Tap to select an anime for details_`,
                footer: "Moonson Bot • Powered by MyAnimeList",
                buttonText: "🏆 View Rankings",
                sections: [{
                    title: title,
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
