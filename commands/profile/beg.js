module.exports = {
    name: "beg",
    aliases: ["freecoins", "giveme", "please"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const senderDb = ctx.db.user;

        if (ctx.sender.isOwner() || senderDb?.premium)
            return await ctx.reply(ctx.format.info("Premium users and owners have unlimited coins!"));

        try {
            // Cooldown: 1 hour between begs
            const currentTime = Date.now();
            const lastBeg = senderDb?.lastBeg || 0;
            const cooldown = 60 * 60 * 1000; // 1 hour
            const remainingTime = cooldown - (currentTime - lastBeg);

            if (remainingTime > 0)
                return await ctx.reply(ctx.format.info(`You can beg again in ${ctx.format.convertMsToDuration(remainingTime)}.`));

            // Random amount: 1-15 coins
            const amount = Math.floor(Math.random() * 15) + 1;
            const currentCoins = senderDb?.coin || 0;

            senderDb.coin = currentCoins + amount;
            senderDb.lastBeg = currentTime;
            senderDb.save();

            const messages = [
                "A kind stranger felt pity and gave you",
                "You found some loose change on the ground:",
                "Someone tossed you a few coins:",
                "The coin gods blessed you with",
                "A generous passer-by donated",
                "You humbly received"
            ];

            const message = messages[Math.floor(Math.random() * messages.length)];

            await ctx.reply(
                `🥺 *BEGGING*\n\n` +
                `❯ ${message} ${amount} coins\n` +
                `💰 Balance: ${senderDb.coin} coins\n\n` +
                `_Come back in 1 hour for more_`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
