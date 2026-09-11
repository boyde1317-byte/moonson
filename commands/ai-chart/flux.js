//image creation 
module.exports = {
    name: "flux",
    category: "ai",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "anime girl with short blue hair")
            );

        try {
            const result = `https://image.pollinations.ai/prompt/${encodeURIComponent(input)}?width=512&height=512&nologo=true`;

            await ctx.reply({
                image: {
                    url: result
                },
                caption: `› ${ctx.format.bold("Prompt")}: ${input}`,
                buttons: [{
                    text: "Take More",
                    id: `${ctx.used.prefix + ctx.used.command} ${input}`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};