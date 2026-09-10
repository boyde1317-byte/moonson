module.exports = {
    name: "animegenre",
    aliases: ["genre", "bygenre"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = (ctx.text || "").toLowerCase();
        const prefix = ctx.used.prefix;

        const validGenres = {
            action: 1, adventure: 2, comedy: 4, drama: 8, fantasy: 10, horror: 14,
            mystery: 7, romance: 22, scifi: 24, sliceoflife: 36, sports: 30, thriller: 41,
            psychological: 40, supernatural: 37, mecha: 18, music: 19, historical: 13,
            military: 38, school: 23, seinen: 42, shoujo: 25, shounen: 27, isekai: 62
        };

        // Find matching genre
        let genreId = null;
        let genreName = "";

        if (input) {
            if (validGenres[input]) {
                genreId = validGenres[input];
                genreName = input;
            } else {
                for (const [name, id] of Object.entries(validGenres)) {
                    if (name.includes(input) || input.includes(name)) {
                        genreId = id;
                        genreName = name;
                        break;
                    }
                }
            }
        }

        if (!genreId)
            return await ctx.reply(
                `*Available Genres*\n\n` +
                `Please specify a genre from the list below:\n\n` +
                Object.keys(validGenres).map((g, i) =>
                    `   ${i + 1}. ${g.charAt(0).toUpperCase() + g.slice(1)}`
                ).join("\n") + `\n\n` +
                `Example: ${ctx.format.inlineCode(prefix + "animegenre action")}`
            );

        try {
            const apiUrl = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&limit=10&sfw=true`;
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.data?.length)
                return await ctx.reply(ctx.format.info(`No anime found in ${genreName} genre.`));

            const rows = res.data.map((a, i) => {
                const name = a.title_english || a.title || "Anime " + (i + 1);
                const score = a.score ? "\u2B50 " + a.score : "N/A";
                const year = a.year || "";
                return {
                    title: (i + 1) + ". " + (name.length > 40 ? name.slice(0, 37) + "..." : name),
                    description: score + (year ? " • " + year : "") + " • " + (a.type || "TV"),
                    rowId: prefix + "animesearch " + a.title
                };
            });

            await ctx.reply({
                text: "\u{1F3AD} *TOP " + genreName.toUpperCase() + " ANIME*\n\n" +
                    "Here are the highest-rated " + genreName + " anime.\n\n" +
                    "_Tap to select an anime for details_",
                footer: "Moonson Bot • Powered by MyAnimeList",
                buttonText: "\u{1F3AD} Select Anime",
                sections: [{
                    title: genreName + " Anime",
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
