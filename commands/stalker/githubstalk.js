module.exports = {
    name: "githubstalk",
    aliases: ["ghstalk", "gitstalk"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "torvalds")
            );

        try {
            // Try nexray API first, fallback to direct GitHub API
            let profile = null;

            try {
                const apiUrl = ctx.api.createUrl("nexray", "/stalker/github", {
                    username: input
                });
                const { data: res } = await ctx.request.get(apiUrl);
                if (res?.status && res?.result) profile = res.result;
            } catch (e) { /* fallback */ }

            // Fallback to direct GitHub API (free, no key, 60 req/hr)
            if (!profile) {
                const apiUrl = "https://api.github.com/users/" + encodeURIComponent(input);
                const { data: res } = await ctx.request.get(apiUrl);

                if (res?.login) {
                    profile = {
                        username: res.login,
                        nickname: res.name || res.login,
                        bio: res.bio,
                        id: res.id,
                        profile_pic: res.avatar_url,
                        url: res.html_url,
                        type: res.type,
                        company: res.company,
                        blog: res.blog,
                        location: res.location,
                        email: res.email,
                        public_repo: res.public_repos,
                        public_gists: res.public_gists,
                        followers: res.followers,
                        following: res.following,
                        created_at: res.created_at
                    };
                }
            }

            if (!profile)
                return await ctx.reply(ctx.format.info('No GitHub user found for "' + input + '".'));

            const name = profile.nickname || profile.username || "Unknown";
            const bio = profile.bio || "No bio available";
            const company = profile.company || "N/A";
            const location = profile.location || "N/A";
            const blog = profile.blog || "N/A";
            const followers = profile.followers ? profile.followers.toLocaleString() : "0";
            const following = profile.following ? profile.following.toLocaleString() : "0";
            const repos = profile.public_repo || profile.public_repos || 0;
            const gists = profile.public_gists || 0;
            const created = profile.created_at ? profile.created_at.slice(0, 10) : "N/A";
            const type = profile.type || "User";

            const caption =
                "🐙 *GITHUB PROFILE*\n\n" +
                "❯ *Name*: " + name + "\n" +
                "❯ *Username*: @" + (profile.username || input) + "\n" +
                "❯ *Type*: " + type + "\n" +
                "❯ *Bio*: " + bio + "\n" +
                "❯ *Company*: " + company + "\n" +
                "❯ *Location*: " + location + "\n" +
                "❯ *Blog*: " + blog + "\n" +
                "❯ *Followers*: " + followers + "\n" +
                "❯ *Following*: " + following + "\n" +
                "❯ *Public Repos*: " + repos + "\n" +
                "❯ *Public Gists*: " + gists + "\n" +
                "❯ *Joined*: " + created + "\n\n" +
                "🔗 " + (profile.url || "https://github.com/" + input);

            if (profile.profile_pic) {
                await ctx.reply({
                    image: { url: profile.profile_pic },
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
