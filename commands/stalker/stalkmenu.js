module.exports = {
    name: "stalkmenu",
    aliases: ["stalk", "stalker"],
    category: "stalker",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        const caption =
            "🕵️ *STALKER MENU*\n\n" +
            "*Available Commands:*\n\n" +
            "❯ " + ctx.format.inlineCode(prefix + "githubstalk <username>") + " — GitHub profile\n" +
            "❯ " + ctx.format.inlineCode(prefix + "twitterstalk <username>") + " — Twitter/X profile\n" +
            "❯ " + ctx.format.inlineCode(prefix + "youtubestalk <username>") + " — YouTube channel\n" +
            "❯ " + ctx.format.inlineCode(prefix + "threadsstalk <username>") + " — Threads profile\n" +
            "❯ " + ctx.format.inlineCode(prefix + "instastalk <username>") + " — Instagram profile\n" +
            "❯ " + ctx.format.inlineCode(prefix + "tiktokstalk <username>") + " — TikTok profile\n" +
            "❯ " + ctx.format.inlineCode(prefix + "npmstalk <package>") + " — NPM package info\n\n" +
            "_Look up public profiles across platforms_";

        await ctx.reply(caption);
    }
};
