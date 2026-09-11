module.exports = {
    name: "tiktoksearch",
    aliases: ["tiktoks", "ttsearch"],
    category: "search",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "evangelion")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/search/tiktok", {
                q: input
            });
            const result = (await ctx.request.get(apiUrl)).data.result[0].data;

            await ctx.reply({
                video: {
                    url: result
                },
                caption: `»› ${ctx.format.bold("Query")}: ${input}`,
                buttons: [{
                    text: "More Results",
                    id: `${ctx.used.prefix + ctx.used.command} ${input}`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};