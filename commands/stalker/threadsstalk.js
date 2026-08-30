module.exports = {
    name: "threadsstalk",
    aliases: ["threadstalk", "thstalk"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "zuck")
            );

        try {
            const apiUrl = ctx.api.createUrl("nexray", "/stalker/threads", {
                username: input
            });
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.status || !res?.result)
                return await ctx.reply(ctx.format.info('No Threads user found for "' + input + '".'));

            const p = res.result;
            const name = p.name || p.username || "Unknown";
            const verified = p.is_verified ? " ✅" : "";
            const bio = p.bio || "No bio available";
            const followers = p.followers ? p.followers.toLocaleString() : "0";
            const avatar = p.profile_picture;
            const hdAvatar = p.hd_profile_picture;
            const links = p.links?.length ? p.links.map(l => "   • " + (l.url || l)).join("\n") : "N/A";

            const caption =
                "🧵 *THREADS PROFILE*\n\n" +
                "❯ *Name*: " + name + verified + "\n" +
                "❯ *Username*: @" + (p.username || input) + "\n" +
                "❯ *Bio*: " + bio + "\n" +
                "❯ *Followers*: " + followers + "\n" +
                "❯ *Links*: " + links + "\n\n" +
                "🔗 https://threads.net/@" + (p.username || input);

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
