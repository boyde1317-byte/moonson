module.exports = {
    name: "tts",
    aliases: ["texttospeech", "speak"],
    category: "tool",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        let input = ctx.text;
        if (!input && ctx.quoted?.body) input = ctx.quoted.body;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Hello, how are you?")}\n` +
                ctx.format.generateNotes([
                    "Convert text to speech audio",
                    "You can also reply to a message to convert it"
                ])
            );

        if (input.length > 500)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 500 characters."));

        try {
            // Google Translate TTS API (free, no key needed)
            const lang = "en";
            const encodedText = encodeURIComponent(input);
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

            await ctx.reply({
                audio: { url: ttsUrl },
                mimetype: "audio/mpeg",
                ptt: false
            });
        } catch (error) {
            // Fallback: try the alwayscodex API
            try {
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/tools/tts", {
                    text: input,
                    lang: "en"
                });
                await ctx.reply({
                    audio: { url: fallbackUrl },
                    mimetype: "audio/mpeg",
                    ptt: false
                });
            } catch (err) {
                await ctx.helper.handleError(ctx, error, true);
            }
        }
    }
};
