module.exports = {
    name: "twitterstalk",
    aliases: ["twstalk", "xstalk"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "elonmusk")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/stalker/twitter", {
                username: input
            });
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.status || !res?.result)
                return await ctx.reply(ctx.format.info('No Twitter/X user found for "' + input + '".'));

            const p = res.result;
            const name = p.name || p.username || "Unknown";
            const verified = p.verified ? " ✅" : "";
            const desc = p.description || "No description available";
            const location = p.location !== "-" ? p.location : "N/A";
            const created = p.created_at || "N/A";
            const tweets = p.stats?.tweets?.toLocaleString() || "0";
            const following = p.stats?.following?.toLocaleString() || "0";
            const followers = p.stats?.followers?.toLocaleString() || "0";
            const likes = p.stats?.likes?.toLocaleString() || "0";
            const media = p.stats?.media?.toLocaleString() || "0";
            const avatar = p.profile?.avatar;
            const banner = p.profile?.banner;

            const caption =
                "🐦 *TWITTER/X PROFILE*\n\n" +
                "❯ *Name*: " + name + verified + "\n" +
                "❯ *Username*: @" + (p.username || input) + "\n" +
                "❯ *Bio*: " + desc + "\n" +
                "❯ *Location*: " + location + "\n" +
                "❯ *Joined*: " + created + "\n\n" +
                "📊 *Stats*\n" +
                "❯ *Tweets*: " + tweets + "\n" +
                "❯ *Followers*: " + followers + "\n" +
                "❯ *Following*: " + following + "\n" +
                "❯ *Likes*: " + likes + "\n" +
                "❯ *Media*: " + media + "\n\n" +
                "🔗 https://x.com/" + (p.username || input);

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
