module.exports = {
    name: "movie",
    aliases: ["imdb", "moviesearch", "film"],
    category: "search",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Inception")}\n` +
                ctx.format.generateNotes(["Search for movie and TV show information"])
            );

        try {
            // Try OMDB (free, no key needed for basic search via the public API)
            // Using the search endpoint with a demo key fallback
            const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(input)}&type=movie&page=1&apikey=3e97e652`;
            const searchRes = (await axios.get(searchUrl, { timeout: 15000 })).data;

            if (searchRes.Response === "False" || !searchRes.Search?.length) {
                // Try TV shows
                const tvUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(input)}&type=series&page=1&apikey=3e97e652`;
                const tvRes = (await axios.get(tvUrl, { timeout: 15000 })).data;

                if (tvRes.Response === "False" || !tvRes.Search?.length) {
                    return await ctx.reply(ctx.format.info(`No movies or shows found for "${input}".`));
                }

                searchRes.Search = tvRes.Search;
            }

            // Get detailed info for the top result
            const topResult = searchRes.Search[0];
            const detailUrl = `https://www.omdbapi.com/?i=${topResult.imdbID}&apikey=3e97e652&plot=short`;
            const detail = (await axios.get(detailUrl, { timeout: 15000 })).data;

            if (detail.Response === "False") {
                // Show basic search results
                const results = searchRes.Search.slice(0, 5).map((m, i) =>
                    `${i + 1}. ${ctx.format.bold(m.Title)} (${m.Year})\n` +
                    `   ❯ Type: ${m.Type}\n` +
                    `   ❯ IMDB: https://www.imdb.com/title/${m.imdbID}`
                ).join("\n\n");

                return await ctx.reply(
                    `🎬 *MOVIE SEARCH*\n\n` +
                    `❯ ${ctx.format.bold("Query")}: ${input}\n` +
                    `❯ ${ctx.format.bold("Results")}: ${searchRes.Search.length} found\n\n` +
                    results
                );
            }

            // Build rich detail view
            let text = `🎬 *${detail.Title}* (${detail.Year})\n\n`;
            text += `❯ ${ctx.format.bold("Type")}: ${detail.Type || "Movie"}\n`;
            text += `❯ ${ctx.format.bold("Rated")}: ${detail.Rated || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("Runtime")}: ${detail.Runtime || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("Genre")}: ${detail.Genre || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("Director")}: ${detail.Director || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("Actors")}: ${detail.Actors || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("IMDB Rating")}: ${detail.imdbRating || "N/A"}/10 (${detail.imdbVotes || "N/A"} votes)\n`;
            text += `❯ ${ctx.format.bold("Released")}: ${detail.Released || "N/A"}\n\n`;
            text += `❯ ${ctx.format.bold("Plot")}: ${detail.Plot || "No plot available."}\n\n`;
            text += `❯ ${ctx.format.bold("IMDB")}: https://www.imdb.com/title/${detail.imdbID}`;

            const poster = detail.Poster && detail.Poster !== "N/A" ? detail.Poster : null;

            if (poster) {
                await ctx.reply({
                    image: { url: poster },
                    caption: text
                });
            } else {
                await ctx.reply(text);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                return await ctx.reply(ctx.format.info(`Movie search is temporarily unavailable. Please try again later.`));
            }
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
