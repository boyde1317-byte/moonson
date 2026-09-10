module.exports = {
    name: "twitchdl",
    aliases: ["twitch", "twdl", "twitchclip"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://clips.twitch.tv/CleanPlacidDonkeyNononoCat")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.twitch.tv/clip/123456")}\n` +
                ctx.format.generateNotes(["Download Twitch clips and VODs"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/twitch\.tv|clips\.twitch/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid Twitch URL!"));

        try {
            // Try nexray Twitch downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/twitch", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/twitch", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            const videoUrl = result?.url || result?.download || result?.video;
            const title = result?.title || "Twitch Clip";
            const broadcaster = result?.broadcaster || result?.author || result?.channel || "Unknown";
            const duration = result?.duration || "N/A";
            const thumbnail = result?.thumbnail || result?.thumb;

            if (!videoUrl) {
                return await ctx.reply(ctx.format.info("No downloadable video found for this Twitch clip."));
            }

            await ctx.reply({
                video: { url: videoUrl },
                caption:
                    `🎮 *TWITCH DOWNLOAD*\n\n` +
                    `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                    `❯ ${ctx.format.bold("Broadcaster")}: ${broadcaster}\n` +
                    `❯ ${ctx.format.bold("Duration")}: ${duration}\n` +
                    `❯ ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
