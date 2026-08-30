module.exports = {
    name: "character",
    aliases: ["char", "animechar"],
    category: "anime",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "Levi Ackerman")
            );

        try {
            const searchUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(input)}&limit=1`;
            const { data: searchRes } = await ctx.request.get(searchUrl);

            if (!searchRes?.data?.length)
                return await ctx.reply(ctx.format.info(`No character found for "${input}".`));

            const char = searchRes.data[0];

            // Get full character details
            const detailUrl = `https://api.jikan.moe/v4/characters/${char.mal_id}/full`;
            const { data: detailRes } = await ctx.request.get(detailUrl);
            const full = detailRes?.data || char;

            const name = full.name || "Unknown";
            const nameKanji = full.name_kanji || "N/A";
            const nicknames = full.nicknames?.length ? full.nicknames.join(", ") : "N/A";
            const favorites = full.favorites ? `${full.favorites.toLocaleString()} favorites` : "N/A";
            const about = full.about
                ? (full.about.length > 500 ? full.about.slice(0, 497) + "..." : full.about)
                : "No description available.";

            // Get anime appearances
            const animeList = full.anime?.slice(0, 3).map(a =>
                `   • ${a.anime?.title || "Unknown"} (${a.role || "role"})`
            ).join("\n") || "N/A";

            const caption =
                `👤 *CHARACTER INFO*\n\n` +
                `❯ *Name*: ${name}\n` +
                `❯ *Kanji*: ${nameKanji}\n` +
                `❯ *Nicknames*: ${nicknames}\n` +
                `❯ *Favorites*: ${favorites}\n\n` +
                `📺 *Anime Appearances*\n${animeList}\n\n` +
                `📖 *About*\n${about}\n\n` +
                `🔗 ${full.url || ""}`;

            if (full.images?.jpg?.image_url) {
                await ctx.reply({
                    image: { url: full.images.jpg.image_url },
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
