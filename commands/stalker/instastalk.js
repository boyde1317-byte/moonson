module.exports = {
    name: "instastalk",
    aliases: ["igstalk", "instagramstalk"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "cristiano")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/stalker/instagram", {
                username: input
            });
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.status || !res?.result) {
                // Check for rate limit error
                if (res?.error?.includes("429"))
                    return await ctx.reply(ctx.format.info("Instagram API is rate limited. Please try again in a few minutes."));
                return await ctx.reply(ctx.format.info('No Instagram user found for "' + input + '".'));
            }

            const p = res.result;
            const name = p.name || p.full_name || p.username || "Unknown";
            const verified = p.is_verified ? " ✅" : "";
            const bio = p.bio || "No bio available";
            const followers = p.followers ? p.followers.toLocaleString() : "0";
            const following = p.following ? p.following.toLocaleString() : "0";
            const posts = p.posts ? p.posts.toLocaleString() : "N/A";
            const avatar = p.profile_picture || p.profile_pic;
            const hdAvatar = p.hd_profile_picture;

            const caption =
                "📸 *INSTAGRAM PROFILE*\n\n" +
                "❯ *Name*: " + name + verified + "\n" +
                "❯ *Username*: @" + (p.username || input) + "\n" +
                "❯ *Bio*: " + bio + "\n" +
                "❯ *Followers*: " + followers + "\n" +
                "❯ *Following*: " + following + "\n" +
                "❯ *Posts*: " + posts + "\n\n" +
                "🔗 https://instagram.com/" + (p.username || input);

            const img = hdAvatar || avatar;
            if (img) {
                await ctx.reply({
                    image: { url: img },
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
