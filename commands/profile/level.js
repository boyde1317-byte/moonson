module.exports = {
    name: "level",
    aliases: ["lvl", "xp", "rank"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        try {
            const senderDb = ctx.db.user;
            const level = senderDb?.level || 0;
            const winGame = senderDb?.winGame || 0;
            const coin = senderDb?.coin || 0;
            const premium = senderDb?.premium || false;

            // XP calculation: each win = 10 XP, level threshold = level * 100 XP
            const xp = winGame * 10;
            const currentLevelXp = level * 100;
            const nextLevelXp = (level + 1) * 100;
            const progress = Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

            // Build progress bar
            const barLength = 15;
            const filledBlocks = Math.round((progress / 100) * barLength);
            const progressBar = "█".repeat(filledBlocks) + "░".repeat(barLength - filledBlocks);

            let statusIcon = "🟢";
            if (premium) statusIcon = "👑";
            else if (level >= 50) statusIcon = "🏆";
            else if (level >= 25) statusIcon = "⭐";
            else if (level >= 10) statusIcon = "🔥";

            await ctx.reply(
                `${statusIcon} *PLAYER STATS*\n\n` +
                `❯ ${ctx.format.bold("Level")}: ${level}\n` +
                `❯ ${ctx.format.bold("Games Won")}: ${winGame}\n` +
                `❯ ${ctx.format.bold("Coins")}: ${coin}\n` +
                `❯ ${ctx.format.bold("Premium")}: ${premium ? "Yes" : "No"}\n\n` +
                `📊 *XP Progress*\n` +
                `${progressBar} ${progress}%\n` +
                `❯ Current: ${xp} XP\n` +
                `❯ Next Level: ${nextLevelXp} XP\n` +
                `❯ Remaining: ${Math.max(0, nextLevelXp - xp)} XP`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
