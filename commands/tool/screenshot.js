module.exports = {
    name: "screenshot",
    aliases: ["ss", "sshp", "sspc", "sstab", "ssweb"],
    category: "tool",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                ctx.format.generateCmdExample(ctx.used, "https://info-moonson.vercel.app")
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        try {
            const result = ctx.api.createUrl("nexray", "/tools/ssweb", {
                url
            });
            const screenshotUrl = (await ctx.request.get(apiUrl)).data.result.file_url;

            await ctx.reply({
                image: {
                    url: screenshotUrl
                },
                caption: `»› ${ctx.format.bold("URL")}: ${url}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};