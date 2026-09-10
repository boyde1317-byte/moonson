module.exports = {
    name: "wanted",
    aliases: ["wantedposter", "mostwanted"],
    category: "maker",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image", "sticker"]);
        const isQuotedImage = ctx.quoted?.type === "image" || ctx.quoted?.type === "sticker";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "")} (reply to an image)\n` +
                ctx.format.generateNotes(["Generate a Wild West wanted poster from any image"])
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

            // Try nexray wanted poster maker
            const imageUrl = ctx.api.createUrl("nexray", "/maker/wanted", { url: uploadUrl });

            await ctx.reply({
                image: { url: imageUrl },
                caption:
                    `🤠 *WANTED POSTER*\n\n` +
                    `❯ WANTED: DEAD OR ALIVE!`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
