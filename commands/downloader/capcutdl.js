module.exports = {
    name: "capcutdl",
    aliases: ["capcut", "ccdl", "cc"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.capcut.com/t/abc123")}\n` +
                ctx.format.generateNotes(["Download CapCut templates and videos"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/capcut\.com/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid CapCut URL!"));

        try {
            // Try nexray CapCut downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/capcut", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/capcut", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            const videoUrl = result?.url || result?.download || result?.video;
            const title = result?.title || result?.description || "CapCut Video";
            const author = result?.author || result?.username || "Unknown";

            if (!videoUrl) {
                return await ctx.reply(ctx.format.info("No downloadable video found for this CapCut link."));
            }

            await ctx.reply({
                video: { url: videoUrl },
                caption:
                    `✂️ *CAPCUT DOWNLOAD*\n\n` +
                    `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                    `❯ ${ctx.format.bold("Author")}: ${author}\n` +
                    `❯ ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
