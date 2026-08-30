module.exports = {
    name: "tiktokstalk",
    aliases: ["ttstalk", "tiktostalk"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "khaby.lame")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/stalker/tiktok", {
                username: input
            });
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.status || !res?.result)
                return await ctx.reply(ctx.format.info(
                    'TikTok profile lookup is currently unavailable for "' + input + '". The API may be experiencing issues. Please try again later.'
                ));

            const p = res.result;
            const name = p.nickname || p.name || p.username || "Unknown";
            const verified = p.verified ? " ✅" : "";
            const bio = p.signature || p.bio || "No bio available";
            const followers = p.followers ? p.followers.toLocaleString() : "0";
            const following = p.following ? p.following.toLocaleString() : "0";
            const likes = p.likes ? p.likes.toLocaleString() : "0";
            const videos = p.videos ? p.videos.toLocaleString() : "0";
            const avatar = p.avatar || p.profile_pic;
            const isPrivate = p.private ? "🔒 Private" : "🌍 Public";

            const caption =
                "🎵 *TIKTOK PROFILE*\n\n" +
                "❯ *Name*: " + name + verified + "\n" +
                "❯ *Username*: @" + (p.username || input) + "\n" +
                "❯ *Bio*: " + bio + "\n" +
                "❯ *Privacy*: " + isPrivate + "\n\n" +
                "📊 *Stats*\n" +
                "❯ *Followers*: " + followers + "\n" +
                "❯ *Following*: " + following + "\n" +
                "❯ *Likes*: " + likes + "\n" +
                "❯ *Videos*: " + videos + "\n\n" +
                "🔗 https://tiktok.com/@" + (p.username || input);

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
