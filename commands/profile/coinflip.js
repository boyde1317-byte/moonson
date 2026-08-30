module.exports = {
    name: "coinflip",
    aliases: ["flip", "cf", "headsortails"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text?.toLowerCase().trim();
        const senderDb = ctx.db.user;

        if (ctx.sender.isOwner() || senderDb?.premium)
            return await ctx.reply(ctx.format.info("Premium users and owners have unlimited coins — no need to gamble!"));

        if (!input || !["heads", "tails"].includes(input))
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "heads")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "tails")}\n` +
                ctx.format.generateNotes([
                    "Bet 10 coins on heads or tails",
                    "Win: +10 coins | Lose: -10 coins"
                ])
            );

        const currentCoins = senderDb?.coin || 0;

        if (currentCoins < 10)
            return await ctx.reply(ctx.format.info(`You need at least 10 coins to play! You have ${currentCoins} coins.`));

        try {
            const result = Math.random() < 0.5 ? "heads" : "tails";
            const won = input === result;

            if (won) {
                senderDb.coin = currentCoins + 10;
                senderDb.save();
                await ctx.reply(
                    `🪙 *COIN FLIP*\n\n` +
                    `❯ You chose: ${ctx.format.bold(input)}\n` +
                    `❯ Result: ${ctx.format.bold(result)}\n\n` +
                    `🎉 You won! +10 coins\n` +
                    `💰 Balance: ${senderDb.coin} coins`
                );
            } else {
                senderDb.coin = currentCoins - 10;
                senderDb.save();
                await ctx.reply(
                    `🪙 *COIN FLIP*\n\n` +
                    `❯ You chose: ${ctx.format.bold(input)}\n` +
                    `❯ Result: ${ctx.format.bold(result)}\n\n` +
                    `💸 You lost! -10 coins\n` +
                    `💰 Balance: ${senderDb.coin} coins`
                );
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
