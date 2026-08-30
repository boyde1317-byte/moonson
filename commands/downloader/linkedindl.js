module.exports = {
    name: "linkedindl",
    aliases: ["linkedin", "lndl", "inpost"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.linkedin.com/posts/username_example")}\n` +
                ctx.format.generateNotes(["Download videos from LinkedIn posts"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/linkedin\.com/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid LinkedIn URL!"));

        try {
            // Try nexray LinkedIn downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/linkedin", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/linkedin", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            const videoUrl = result?.url || result?.download || result?.video;
            const title = result?.title || result?.caption || "LinkedIn Post";
            const author = result?.author || result?.username || "Unknown";

            if (!videoUrl) {
                return await ctx.reply(ctx.format.info("No downloadable video found in this LinkedIn post."));
            }

            await ctx.reply({
                video: { url: videoUrl },
                caption:
                    `💼 *LINKEDIN DOWNLOAD*\n\n` +
                    `❯ ${ctx.format.bold("Author")}: ${author}\n` +
                    `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                    `❯ ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
