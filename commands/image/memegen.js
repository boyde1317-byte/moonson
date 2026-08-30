module.exports = {
    name: "imgmemegen",
    aliases: ["memegen", "captionmeme"],
    category: "image",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";
        const input = ctx.text;

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                ctx.format.generateInstruction(["send", "reply"], ["image"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "(reply to image) When the code finally works")
            );

        if (!input)
            return await ctx.reply(ctx.format.info("Provide a caption text for the meme."));

        try {
            let uploadUrl;
            if (isMedia) {
                uploadUrl = await ctx.msg.upload();
            } else {
                uploadUrl = await ctx.quoted.upload();
            }

            if (!uploadUrl)
                return await ctx.reply(ctx.format.info("Could not upload the image. Please try again."));

            const apiUrl = "https://api.popcat.xyz/meme?images=" + encodeURIComponent(uploadUrl) + "&text=" + encodeURIComponent(input);

            await ctx.reply({
                image: { url: apiUrl },
                caption: `😂 *MEME GENERATED*`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
