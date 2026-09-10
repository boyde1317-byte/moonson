module.exports = {
    name: "youtubestalk",
    aliases: ["ytstalk", "ytchannel"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "MrBeast")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/stalker/youtube", {
                username: input
            });
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.status || !res?.result)
                return await ctx.reply(ctx.format.info('No YouTube channel found for "' + input + '".'));

            const ch = res.result.channel || res.result;
            const name = ch.name || ch.username || input;
            const username = ch.username || "@" + input;
            const subs = ch.subscriberCount || "N/A";
            const videos = ch.videoCount || "N/A";
            const desc = ch.description
                ? (ch.description.length > 300 ? ch.description.slice(0, 297) + "..." : ch.description)
                : "No description available";
            const avatar = ch.avatarUrl;
            const channelUrl = ch.channelUrl || ("https://youtube.com/@" + input);

            const caption =
                "📺 *YOUTUBE CHANNEL*\n\n" +
                "❯ *Name*: " + name + "\n" +
                "❯ *Handle*: " + username + "\n" +
                "❯ *Subscribers*: " + subs + "\n" +
                "❯ *Videos*: " + videos + "\n\n" +
                "📖 *Description*\n" + desc + "\n\n" +
                "🔗 " + channelUrl;

            if (avatar) {
                await ctx.reply({
                    image: { url: avatar },
                    caption
                });
            } else {
                await ctx.reply(caption);
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
