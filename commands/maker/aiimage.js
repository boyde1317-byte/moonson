module.exports = {
    name: "aiimage",
    aliases: ["aigimage", "generateimage", "imggen"],
    category: "maker",
    permissions: {
        coin: 15
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "a futuristic city at sunset, neon lights, cyberpunk")}\n` +
                ctx.format.generateNotes([
                    "Generate AI images from text descriptions",
                    "Be descriptive for better results!"
                ])
            );

        if (input.length > 500)
            return await ctx.reply(ctx.format.info("Prompt too long! Maximum 500 characters."));

        try {
            // Try Pollinations AI — free, no key needed
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(input);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

            await ctx.reply({
                image: { url: imageUrl },
                caption:
                    `🎨 *AI IMAGE GENERATOR*\n\n` +
                    `❯ ${ctx.format.bold("Prompt")}: ${input}\n` +
                    `❯ ${ctx.format.bold("Seed")}: ${seed}\n` +
                    `❯ ${ctx.format.bold("Model")}: Flux`,
                buttons: [
                    { text: "Regenerate", id: `${ctx.used.prefix}${ctx.used.command} ${input}` }
                ]
            });
        } catch (error) {
            // Fallback: try nexray AI image endpoint
            try {
                const fallbackUrl = ctx.api.createUrl("nexray", "/maker/ai-image", { text: input });
                await ctx.reply({
                    image: { url: fallbackUrl },
                    caption: `🎨 *AI IMAGE GENERATOR*\n\n❯ ${ctx.format.bold("Prompt")}: ${input}`
                });
            } catch (err) {
                await ctx.helper.handleError(ctx, error, true);
            }
        }
    }
};
