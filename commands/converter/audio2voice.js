module.exports = {
    name: "audio2voice",
    aliases: ["toptt", "tovoice", "ptt", "voice"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["audio"]);
        const isQuotedAudio = ctx.quoted?.type === "audio";

        if (!isMedia && !isQuotedAudio)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["audio"])}\n` +
                ctx.format.generateNotes([
                    "Convert any audio to a WhatsApp voice note (PTT)",
                    "Reply to an audio file or send one with the command"
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
                return await ctx.reply(ctx.format.info("Could not download the audio. Please try again."));

            // Send the same audio back as PTT (push-to-talk / voice note)
            await ctx.reply({
                audio: buffer,
                mimetype: "audio/mpeg",
                ptt: true
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
