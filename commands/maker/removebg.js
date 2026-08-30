module.exports = {
    name: "removebg",
    aliases: ["rembg", "transparentbg"],
    category: "maker",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                ctx.format.generateNotes(["Remove the background from any image and get a transparent PNG"])
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

            // Use the removebackground tool endpoint (existing config uses this)
            const imageUrl = ctx.api.createUrl("alwayscodex", "/api/tools/removebg", { url: uploadUrl });

            await ctx.reply({
                image: { url: imageUrl },
                caption: `✂️ *BACKGROUND REMOVED*\n\n❯ Your image background has been removed!`
            });
        } catch (error) {
            // Fallback: try nexray
            try {
                const fallbackUrl = ctx.api.createUrl("nexray", "/tools/removebg", { url: uploadUrl });
                await ctx.reply({
                    image: { url: fallbackUrl },
                    caption: `✂️ *BACKGROUND REMOVED*`
                });
            } catch (err) {
                await ctx.helper.handleError(ctx, error, true);
            }
        }
    }
};
