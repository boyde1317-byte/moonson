module.exports = {
    name: "textlogo",
    aliases: ["logo", "typography"],
    category: "maker",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Moonson")}\n` +
                ctx.format.generateNotes([
                    "Generate stylish text logos",
                    "Maximum 30 characters"
                ])
            );

        if (input.length > 30)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 30 characters."));

        try {
            // Try nexray text logo endpoints
            const styles = [
                { name: "Neon", endpoint: "/maker/neon", params: { text: input } },
                { name: "Glitch", endpoint: "/maker/glitch", params: { text1: input, text2: input } },
                { name: "Thunder", endpoint: "/maker/thunder", params: { text: input } },
                { name: "Devil", endpoint: "/maker/devil", params: { text: input } },
                { name: "Summery", endpoint: "/maker/summery", params: { text: input } },
                { name: "Underwater", endpoint: "/maker/underwater", params: { text: input } },
                { name: "Blackpink", endpoint: "/maker/blackpink", params: { text: input } },
                { name: "Lava", endpoint: "/maker/lava", params: { text: input } }
            ];

            // Pick a random style for variety
            const style = styles[Math.floor(Math.random() * styles.length)];
            const imageUrl = ctx.api.createUrl("nexray", style.endpoint, style.params);

            await ctx.reply({
                image: { url: imageUrl },
                caption:
                    `✨ *TEXT LOGO*\n\n` +
                    `❯ ${ctx.format.bold("Text")}: ${input}\n` +
                    `❯ ${ctx.format.bold("Style")}: ${style.name}`,
                buttons: styles.slice(0, 4).map((s, i) => ({
                    text: s.name,
                    id: `${ctx.used.prefix}textlogo_${i} ${input}`
                }))
            });
        } catch (error) {
            // Fallback: try a different approach with siputzx
            try {
                const fallbackUrl = ctx.api.createUrl("siputzx", "/api/canvas/ttp", { text: input });
                await ctx.reply({
                    image: { url: fallbackUrl },
                    caption: `✨ *TEXT LOGO*\n\n❯ ${ctx.format.bold("Text")}: ${input}`
                });
            } catch (err) {
                await ctx.helper.handleError(ctx, error, true);
            }
        }
    }
};
