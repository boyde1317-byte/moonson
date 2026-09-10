module.exports = {
    name: "imgwanted",
    aliases: ["wantedimg", "wantedposter"],
    category: "image",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                ctx.format.generateInstruction(["send", "reply"], ["image"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "(reply to an image)")
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

            const apiUrl = "https://api.popcat.xyz/wanted?image=" + encodeURIComponent(uploadUrl);

            await ctx.reply({
                image: { url: apiUrl },
                caption: `🤠 *WANTED*`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
