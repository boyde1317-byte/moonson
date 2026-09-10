module.exports = {
    name: "video2img",
    aliases: ["vid2img", "frame", "vframe", "videothumb"],
    category: "converter",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["video"]);
        const isQuotedVideo = ctx.quoted?.type === "video";

        if (!isMedia && !isQuotedVideo)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["video"])}\n` +
                ctx.format.generateNotes([
                    "Extract the first frame from a video as an image",
                    "Reply to a video or send one with the command"
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
                return await ctx.reply(ctx.format.info("Could not download the video. Please try again."));

            // Upload the video and use nekochii converter to extract frame
            const uploadUrl = await ctx.msg.upload() || await ctx.quoted.upload();

            if (!uploadUrl)
                return await ctx.reply(ctx.format.info("Could not upload the video. Please try again."));

            // Try nekochii video-to-image converter
            const apiUrl = `https://nekochii-converter.hf.space/mp4toimg`;
            let result;
            try {
                result = (await ctx.request.post(apiUrl, {
                    file: buffer.toString("base64"),
                    json: true
                })).data.result;
            } catch (e) {
                // Fallback: try nexray
                const fallbackUrl = ctx.api.createUrl("nexray", "/converter/video2img", { url: uploadUrl });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            if (!result)
                return await ctx.reply(ctx.format.info("Could not extract a frame from the video."));

            await ctx.reply({
                image: { url: result },
                caption: `🎬 *VIDEO TO IMAGE*\n\n❯ Extracted first frame from video`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
