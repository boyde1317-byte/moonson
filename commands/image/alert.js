module.exports = {
    name: "imgalert",
    aliases: ["alertmeme", "emergencyalert"],
    category: "image",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "The bot is down!")
            );

        try {
            const apiUrl = "https://api.popcat.xyz/alert?text=" + encodeURIComponent(input);
            await ctx.reply({
                image: { url: apiUrl },
                caption: `🚨 *EMERGENCY ALERT*`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
