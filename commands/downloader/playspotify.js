module.exports = {
    name: "playspotify",
    aliases: ["playsp", "spotsearch"],
    category: "downloader",
    permissions: {
        coin: 12
    },

    code: async (ctx) => {
        const input = ctx.text;
        const prefix = ctx.used.prefix;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "blinding lights the weeknd")}\n` +
                ctx.format.generateNotes([
                    "Search Spotify for tracks and select from results",
                    "Tap the button to open the list, then pick a track to download"
                ])
            );

        try {
            // Search Spotify via nexray API
            let tracks = [];

            try {
                const apiUrl = ctx.api.createUrl("nexray", "/search/spotify", {
                    q: input
                });
                const response = await ctx.request.get(apiUrl);
                tracks = response?.data?.result || [];
            } catch (e) {
                // Fallback: siputzx
                try {
                    const apiUrl = ctx.api.createUrl("siputzx", "/api/search/spotify", {
                        query: input
                    });
                    const response = await ctx.request.get(apiUrl);
                    tracks = response?.data?.result || response?.data?.data || [];
                } catch (e2) {
                    // Continue
                }
            }

            if (tracks.length === 0)
                return await ctx.reply(ctx.format.info(`No Spotify results found for "${input}". Try a different keyword.`));

            const results = tracks.slice(0, 10);

            const rows = results.map((t, i) => {
                const title = t.title?.length > 50 ? t.title.slice(0, 47) + "..." : (t.title || `Track ${i + 1}`);
                const artist = t.artist || t.artists || "Unknown Artist";
                const duration = t.duration || "";

                // Spotify download URL
                const spotifyUrl = t.url || t.external_urls?.spotify || t.link || "";

                return {
                    title: title,
                    description: artist + (duration ? ` • ${duration}` : ""),
                    rowId: spotifyUrl ? `${prefix}spotifydl ${spotifyUrl}` : ""
                };
            }).filter(r => r.rowId); // Only include rows with valid URLs

            if (rows.length === 0)
                return await ctx.reply(ctx.format.info("Found tracks but could not retrieve download links. Please try again."));

            await ctx.reply({
                text: `🎧 *SPOTIFY SEARCH*\n\n` +
                    `❯ Query: ${ctx.format.bold(input)}\n` +
                    `❯ Results: ${rows.length} track${rows.length > 1 ? "s" : ""} found\n\n` +
                    `_Tap the button below to select a track to download_`,
                footer: "Moonson Bot • Select a track to download",
                buttonText: "🎧 Select Track",
                sections: [{
                    title: "Spotify Results",
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
