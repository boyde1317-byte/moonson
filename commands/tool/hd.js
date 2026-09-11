module.exports = {
    name: "hd",
    category: "tool",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);

        if (!isMedia) return await ctx.reply(ctx.format.generateInstruction(["send", "reply"], ["image"]));

        try {
            const uploadUrl = await ctx.msg.upload() || await ctx.quoted.upload();
            const result = ctx.api.createUrl("nexray", "/tools/upscale", {
                url: uploadUrl,
                resolusi: 2
            });

            await ctx.reply({
                image: {
                    url: result
                }
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};