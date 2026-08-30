module.exports = {
    name: "slotmachine",
    aliases: ["slots", "spin", "slot"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const senderDb = ctx.db.user;

        if (ctx.sender.isOwner() || senderDb?.premium)
            return await ctx.reply(ctx.format.info("Premium users and owners have unlimited coins — no need to gamble!"));

        const currentCoins = senderDb?.coin || 0;

        if (currentCoins < 20)
            return await ctx.reply(ctx.format.info(`You need at least 20 coins to spin! You have ${currentCoins} coins.`));

        try {
            // Slot symbols with weights
            const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "💎"];
            const weights = [30, 25, 20, 12, 8, 4, 1];

            const spin = () => {
                const total = weights.reduce((a, b) => a + b, 0);
                let r = Math.random() * total;
                for (let i = 0; i < symbols.length; i++) {
                    r -= weights[i];
                    if (r <= 0) return symbols[i];
                }
                return symbols[0];
            };

            const reel1 = spin();
            const reel2 = spin();
            const reel3 = spin();

            let payout = 0;
            let message = "";

            if (reel1 === reel2 && reel2 === reel3) {
                // Three of a kind
                const symbolIndex = symbols.indexOf(reel1);
                const multipliers = [5, 8, 12, 20, 35, 50, 100];
                payout = multipliers[symbolIndex];
                message = `🎉 JACKPOT! Three ${reel1}s! +${payout} coins!`;
            } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
                // Two of a kind
                payout = 5;
                message = `✨ Two of a kind! +${payout} coins!`;
            } else {
                payout = -20;
                message = `💸 No match! -20 coins`;
            }

            senderDb.coin = currentCoins + payout;
            senderDb.save();

            await ctx.reply(
                `🎰 *SLOT MACHINE*\n\n` +
                `┌─────┬─────┬─────┐\n` +
                `│  ${reel1}  │  ${reel2}  │  ${reel3}  │\n` +
                `└─────┴─────┴─────┘\n\n` +
                `${message}\n` +
                `💰 Balance: ${senderDb.coin} coins`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
