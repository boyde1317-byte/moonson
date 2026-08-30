module.exports = {
    name: "soundclouddl",
    aliases: ["soundcloud", "scdl", "sc"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const flag = ctx.flag({
            document: {
                type: "boolean",
                short: "d",
                default: false
            }
        });
        const url = flag.input || ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://soundcloud.com/artist/track -d")}\n` +
                ctx.format.generateNotes(["Download audio from SoundCloud", "-d to send as document"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/soundcloud\.com/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid SoundCloud URL!"));

        try {
            // Try nexray SoundCloud downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/soundcloud", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/soundcloud", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            const downloadUrl = result?.url || result?.download || result?.audio;
            const title = result?.title || "SoundCloud Track";
            const artist = result?.author || result?.artist || "Unknown";
            const duration = result?.duration || "N/A";
            const thumbnail = result?.thumbnail || result?.cover || result?.image;

            if (!downloadUrl) {
                return await ctx.reply(ctx.format.info("No downloadable audio found for this SoundCloud track."));
            }

            const caption =
                `☁️ *SOUNDCLOUD DOWNLOAD*\n\n` +
                `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                `❯ ${ctx.format.bold("Artist")}: ${artist}\n` +
                `❯ ${ctx.format.bold("Duration")}: ${duration}`;

            if (flag.document) {
                await ctx.reply({
                    document: { url: downloadUrl },
                    fileName: `${title}.mp3`,
                    mimetype: "audio/mpeg",
                    caption
                });
            } else {
                await ctx.reply({
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg"
                });
                // Send caption separately
                await ctx.reply(caption);
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
