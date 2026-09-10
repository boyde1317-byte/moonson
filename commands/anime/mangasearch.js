module.exports = {
    name: "mangasearch",
    aliases: ["manga", "mangainfo"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "One Piece")
            );

        try {
            const searchUrl = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(input)}&limit=5&sfw=true`;
            const { data: searchRes } = await ctx.request.get(searchUrl);

            if (!searchRes?.data?.length)
                return await ctx.reply(ctx.format.info(`No manga found for "${input}".`));

            const manga = searchRes.data[0];

            const title = manga.title_english || manga.title || "Unknown";
            const score = manga.score ? `⭐ ${manga.score}/10` : "N/A";
            const status = manga.status || "Unknown";
            const chapters = manga.chapters ? `${manga.chapters} chapters` : "Unknown";
            const volumes = manga.volumes ? `${manga.volumes} volumes` : "Unknown";
            const type = manga.type || "Manga";
            const author = manga.authors?.[0]?.name || "Unknown";
            const genres = manga.genres?.map(g => g.name).join(", ") || "N/A";
            const synopsis = manga.synopsis
                ? (manga.synopsis.length > 400 ? manga.synopsis.slice(0, 397) + "..." : manga.synopsis)
                : "No synopsis available.";

            const caption =
                `📚 *MANGA INFO*\n\n` +
                `❯ *Title*: ${title}\n` +
                `❯ *Japanese*: ${manga.title_japanese || "N/A"}\n` +
                `❯ *Type*: ${type}\n` +
                `❯ *Chapters*: ${chapters}\n` +
                `❯ *Volumes*: ${volumes}\n` +
                `❯ *Status*: ${status}\n` +
                `❯ *Author*: ${author}\n` +
                `❯ *Genres*: ${genres}\n` +
                `❯ *Score*: ${score}\n` +
                `❯ *Rank*: #${manga.rank || "N/A"}\n\n` +
                `📖 *Synopsis*\n${synopsis}\n\n` +
                `🔗 ${manga.url}`;

            if (manga.images?.jpg?.large_image_url) {
                await ctx.reply({
                    image: { url: manga.images.jpg.large_image_url },
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
