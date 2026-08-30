module.exports = {
    name: "twitterdl",
    aliases: ["twitter", "twdl", "xdl", "x"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://twitter.com/elaboraterecord/status/1762106406298333265")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://x.com/elaboraterecord/status/1762106406298333265")}\n` +
                ctx.format.generateNotes(["Download videos from Twitter / X posts"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/(twitter|x)\.com/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid Twitter/X URL!"));

        try {
            // Try nexray Twitter downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/twitter", { url });
            let response;
            try {
                response = (await ctx.request.get(apiUrl)).data;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/twitter", { url });
                response = (await ctx.request.get(fallbackUrl)).data;
            }

            const result = response.result || response.data;

            // Extract best quality video
            let videoUrl = null;
            let quality = "N/A";

            if (result?.url) {
                videoUrl = result.url;
                quality = result.quality || result.resolution || "N/A";
            } else if (result?.videos?.length) {
                // Pick highest quality
                const sorted = result.videos.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                videoUrl = sorted[0].url;
                quality = sorted[0].quality || sorted[0].resolution || "N/A";
            } else if (result?.download) {
                videoUrl = result.download;
            } else if (typeof result === "string" && result.includes("http")) {
                videoUrl = result;
            }

            if (!videoUrl) {
                return await ctx.reply(ctx.format.info("No downloadable video found in this tweet."));
            }

            // Extract metadata
            const description = result?.description || result?.text || result?.caption || "Twitter Video";
            const author = result?.author || result?.username || result?.user || "Unknown";
            const thumbnail = result?.thumbnail || result?.thumb || result?.cover;

            await ctx.reply({
                video: { url: videoUrl },
                caption:
                    `🐦 *TWITTER / X DOWNLOAD*\n\n` +
                    `❯ ${ctx.format.bold("Author")}: @${author}\n` +
                    `❯ ${ctx.format.bold("Quality")}: ${quality}\n` +
                    `❯ ${ctx.format.bold("Description")}: ${description}\n` +
                    `❯ ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
