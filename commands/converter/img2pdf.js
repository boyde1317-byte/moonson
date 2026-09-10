module.exports = {
    name: "img2pdf",
    aliases: ["imagepdf", "topdf", "imagestopdf"],
    category: "converter",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                ctx.format.generateNotes([
                    "Convert an image to a PDF document",
                    "Reply to an image or send one with the command"
                ])
            );

        try {
            let buffer;
            if (isMedia) {
                buffer = await ctx.msg.download();
            } else {
                buffer = await ctx.quoted.download();
            }

            if (!buffer)
                return await ctx.reply(ctx.format.info("Could not download the image. Please try again."));

            // Try nexray image-to-PDF converter
            const apiUrl = ctx.api.createUrl("nexray", "/converter/img2pdf", {
                url: await ctx.msg.upload() || await ctx.quoted.upload()
            });

            const response = await ctx.request.get(apiUrl).catch(async () => {
                // Fallback: try alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/tools/img2pdf", {
                    url: await ctx.msg.upload() || await ctx.quoted.upload()
                });
                return await ctx.request.get(fallbackUrl);
            });

            const result = response.data?.result || response.data?.url || response.data?.download;

            if (!result) {
                return await ctx.reply(ctx.format.info("Could not convert the image to PDF. Please try again."));
            }

            await ctx.reply({
                document: { url: result },
                fileName: "converted.pdf",
                mimetype: "application/pdf",
                caption: `📄 *IMAGE TO PDF*\n\n❯ Your image has been converted to PDF!`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
