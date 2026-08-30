module.exports = {
    name: "circlecrop",
    aliases: ["circle", "circleimg", "roundcrop"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image", "sticker"]);
        const isQuotedImage = ctx.quoted?.type === "image" || ctx.quoted?.type === "sticker";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                ctx.format.generateNotes([
                    "Crop an image into a circle",
                    "Great for profile pictures"
                ])
            );

        try {
            let uploadUrl;
            if (isMedia) {
                uploadUrl = await ctx.msg.upload();
            } else {
                uploadUrl = await ctx.quoted.upload();
            }

            if (!uploadUrl)
                return await ctx.reply(ctx.format.info("Could not upload the image. Please try again."));

            // Try nexray circle crop
            const imageUrl = ctx.api.createUrl("nexray", "/converter/circle", { url: uploadUrl });

            let result;
            try {
                result = (await ctx.request.get(imageUrl)).data.result;
            } catch (e) {
                // Fallback: siputzx circle crop
                const fallbackUrl = ctx.api.createUrl("siputzx", "/api/canvas/circle", { url: uploadUrl });
                result = (await ctx.request.get(fallbackUrl)).data?.result || fallbackUrl;
            }

            await ctx.reply({
                image: { url: typeof result === "string" ? result : result?.url },
                caption: `⭕ *CIRCLE CROP*\n\n❯ Your image has been cropped into a circle!`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
