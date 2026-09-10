module.exports = {
    name: "lyrics",
    aliases: ["lyric", "songlyrics"],
    category: "search",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Bohemian Rhapsody Queen")}\n` +
                ctx.format.generateNotes([
                    "Search for song lyrics by title and/or artist",
                    "Format: song title - artist (artist is optional)"
                ])
            );

        try {
            // Try the siputzx lyrics API first
            const apiUrl = ctx.api.createUrl("siputzx", "/api/lyrics", { q: input });
            let res;
            try {
                res = (await axios.get(apiUrl, { timeout: 15000 })).data;
            } catch (e) {
                // Fallback to nexray
                const fallbackUrl = ctx.api.createUrl("nexray", "/search/lyrics", { q: input });
                res = (await axios.get(fallbackUrl, { timeout: 15000 })).data;
            }

            if (res.status === false || (!res.result && !res.data)) {
                return await ctx.reply(ctx.format.info(`No lyrics found for "${input}".`));
            }

            const lyrics = res.result?.lyrics || res.data?.lyrics || res.result;
            const title = res.result?.title || res.data?.title || input;
            const artist = res.result?.artist || res.data?.artist || "Unknown";
            const thumb = res.result?.thumb || res.data?.thumb || res.result?.image || null;

            if (typeof lyrics !== "string" || lyrics.length < 10) {
                return await ctx.reply(ctx.format.info(`No lyrics found for "${input}".`));
            }

            // Truncate if too long (WhatsApp has message limits)
            const maxLength = 2500;
            const lyricsText = lyrics.length > maxLength
                ? lyrics.substring(0, maxLength).trim() + "\n\n...(lyrics truncated)"
                : lyrics;

            const caption =
                `🎵 *LYRICS*\n\n` +
                `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                `❯ ${ctx.format.bold("Artist")}: ${artist}\n\n` +
                `${lyricsText}`;

            if (thumb) {
                await ctx.reply({
                    image: { url: thumb },
                    caption
                });
            } else {
                await ctx.reply(caption);
            }
        } catch (error) {
            // If all APIs fail, suggest trying with different format
            if (error.response?.status === 404 || error.code === "ERR_BAD_REQUEST") {
                return await ctx.reply(
                    ctx.format.info(`No lyrics found for "${input}". Try including the artist name, e.g. "song title - artist".`)
                );
            }
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
