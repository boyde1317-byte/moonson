module.exports = {
    name: "redditdl",
    aliases: ["reddit", "reddl", "rddownload"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.reddit.com/r/funny/comments/example/")}\n` +
                ctx.format.generateNotes(["Download videos from Reddit posts"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/reddit\.com|redd\.it/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid Reddit URL!"));

        try {
            // Try nexray Reddit downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/reddit", { url });
            let response;
            try {
                response = (await ctx.request.get(apiUrl)).data;
            } catch (e) {
                // Fallback: try alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/reddit", { url });
                response = (await ctx.request.get(fallbackUrl)).data;
            }

            const result = response.result || response.data;

            // Reddit can have video, image, or gallery
            const videoUrl = result?.url || result?.video || result?.download;
            const imageUrl = result?.image || result?.url;
            const title = result?.title || "Reddit Post";
            const author = result?.author || result?.username || "Unknown";
            const subreddit = result?.subreddit || "Unknown";
            const nsfw = result?.nsfw || false;

            if (videoUrl && videoUrl.includes("video")) {
                // Video post
                await ctx.reply({
                    video: { url: videoUrl },
                    caption:
                        `🔴 *REDDIT DOWNLOAD*\n\n` +
                        `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                        `❯ ${ctx.format.bold("Author")}: u/${author}\n` +
                        `❯ ${ctx.format.bold("Subreddit")}: r/${subreddit}\n` +
                        `❯ ${ctx.format.bold("URL")}: ${url}`
                });
            } else if (imageUrl) {
                // Image post
                await ctx.reply({
                    image: { url: imageUrl },
                    caption:
                        `🔴 *REDDIT DOWNLOAD*\n\n` +
                        `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                        `❯ ${ctx.format.bold("Author")}: u/${author}\n` +
                        `❯ ${ctx.format.bold("Subreddit")}: r/${subreddit}`
                });
            } else {
                return await ctx.reply(ctx.format.info("No downloadable media found in this Reddit post."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
