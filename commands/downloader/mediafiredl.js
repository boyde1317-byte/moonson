module.exports = {
    name: "mediafiredl",
    aliases: ["mediafire", "mfdl", "mf"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.mediafire.com/file/abc123/file.zip")}\n` +
                ctx.format.generateNotes(["Download files from MediaFire links"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/mediafire\.com/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid MediaFire URL!"));

        try {
            // Try nexray MediaFire downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/mediafire", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/mediafire", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            const downloadUrl = result?.url || result?.download || result?.link;
            const filename = result?.filename || result?.name || result?.title || "file";
            const filesize = result?.filesize || result?.size || "N/A";
            const filetype = result?.filetype || result?.ext || result?.type || "N/A";

            if (!downloadUrl) {
                return await ctx.reply(ctx.format.info("Could not extract the download link from this MediaFire URL."));
            }

            // Send as document
            await ctx.reply({
                document: { url: downloadUrl },
                fileName: filename,
                caption:
                    `📁 *MEDIAFIRE DOWNLOAD*\n\n` +
                    `❯ ${ctx.format.bold("Filename")}: ${filename}\n` +
                    `❯ ${ctx.format.bold("Size")}: ${filesize}\n` +
                    `❯ ${ctx.format.bold("Type")}: ${filetype}\n` +
                    `❯ ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
