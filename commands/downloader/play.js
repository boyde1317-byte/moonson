const axios = require("axios");

module.exports = {
    name: "play",
    aliases: ["playmusic", "playsong"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const input = ctx.text;
        const prefix = ctx.used.prefix;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "one last kiss - hikaru utada")}\n` +
                ctx.format.generateNotes([
                    "Search YouTube for music and select from results",
                    "Tap the button to open the list, then pick a song to download as audio"
                ])
            );

        try {
            // Search YouTube via alwayscodex API
            let videos = [];

            try {
                const apiUrl = ctx.api.createUrl("alwayscodex", "/api/search/youtube-search", {
                    query: input
                });
                const response = await ctx.request.get(apiUrl);
                videos = response?.data?.result?.videos || [];
            } catch (e) {
                // Fallback: nexray
                try {
                    const apiUrl = ctx.api.createUrl("nexray", "/search/youtube", {
                        q: input
                    });
                    const response = await ctx.request.get(apiUrl);
                    videos = response?.data?.result || [];
                } catch (e2) {
                    // Continue
                }
            }

            if (videos.length === 0)
                return await ctx.reply(ctx.format.info(`No results found for "${input}". Try a different keyword.`));

            // Limit to 10 results (WhatsApp list message limit)
            const results = videos.slice(0, 10);

            // Build list message rows
            const rows = results.map((v, i) => {
                const title = v.title?.length > 50 ? v.title.slice(0, 47) + "..." : (v.title || `Result ${i + 1}`);
                const channel = v.channel || v.author || "Unknown";
                const duration = v.duration || v.timestamp || "";
                const desc = duration ? `${channel} • ${duration}` : channel;

                return {
                    title: title,
                    description: desc,
                    rowId: `${prefix}youtubeaudio ${v.url}`
                };
            });

            await ctx.reply({
                text: `🎵 *YOUTUBE MUSIC SEARCH*\n\n` +
                    `❯ Query: ${ctx.format.bold(input)}\n` +
                    `❯ Results: ${results.length} song${results.length > 1 ? "s" : ""} found\n\n` +
                    `_Tap the button below to select a song to download as audio_`,
                footer: "Moonson Bot • Select a song to download",
                buttonText: "🎵 Select Song",
                sections: [{
                    title: "Search Results",
                    rows: rows
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
