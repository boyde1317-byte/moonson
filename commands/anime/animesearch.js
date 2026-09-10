module.exports = {
    name: "animesearch",
    aliases: ["anime", "animeinfo"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "Attack on Titan")
            );

        try {
            // Search via Jikan API (MyAnimeList)
            const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(input)}&limit=5&sfw=true`;
            const { data: searchRes } = await ctx.request.get(searchUrl);

            if (!searchRes?.data?.length)
                return await ctx.reply(ctx.format.info(`No anime found for "${input}".`));

            // Get the top result details
            const anime = searchRes.data[0];

            const title = anime.title_english || anime.title || "Unknown";
            const score = anime.score ? `⭐ ${anime.score}/10` : "N/A";
            const status = anime.status || "Unknown";
            const episodes = anime.episodes ? `${anime.episodes} eps` : "Unknown";
            const type = anime.type || "TV";
            const year = anime.year || "N/A";
            const studio = anime.studios?.[0]?.name || "Unknown";
            const genres = anime.genres?.map(g => g.name).join(", ") || "N/A";
            const synopsis = anime.synopsis
                ? (anime.synopsis.length > 400 ? anime.synopsis.slice(0, 397) + "..." : anime.synopsis)
                : "No synopsis available.";

            const caption =
                `📺 *ANIME INFO*\n\n` +
                `❯ *Title*: ${title}\n` +
                `❯ *Japanese*: ${anime.title_japanese || "N/A"}\n` +
                `❯ *Type*: ${type}\n` +
                `❯ *Episodes*: ${episodes}\n` +
                `❯ *Status*: ${status}\n` +
                `❯ *Aired*: ${year}\n` +
                `❯ *Studio*: ${studio}\n` +
                `❯ *Genres*: ${genres}\n` +
                `❯ *Score*: ${score}\n` +
                `❯ *Rank*: #${anime.rank || "N/A"}\n\n` +
                `📖 *Synopsis*\n${synopsis}\n\n` +
                `🔗 ${anime.url}`;

            // Send with cover image
            if (anime.images?.jpg?.large_image_url) {
                await ctx.reply({
                    image: { url: anime.images.jpg.large_image_url },
                    caption
                });
            } else {
                await ctx.reply(caption);
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
