module.exports = {
    name: "dice",
    aliases: ["roll", "diceroll", "rolldice"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text;
        const senderDb = ctx.db.user;

        if (ctx.sender.isOwner() || senderDb?.premium)
            return await ctx.reply(ctx.format.info("Premium users and owners have unlimited coins — no need to gamble!"));

        const currentCoins = senderDb?.coin || 0;

        if (currentCoins < 10)
            return await ctx.reply(ctx.format.info(`You need at least 10 coins to play! You have ${currentCoins} coins.`));

        try {
            // Parse input: number 1-6 or "high"/"low"
            const guess = parseInt(input);
            const mode = input?.toLowerCase().trim();

            let playerRoll, botRoll;
            let won = false;
            let payout = 0;
            let description = "";

            if (mode === "high" || mode === "low") {
                // High/Low mode: bet on whether your roll is higher or lower than bot's
                playerRoll = Math.floor(Math.random() * 6) + 1;
                botRoll = Math.floor(Math.random() * 6) + 1;

                if (mode === "high") {
                    won = playerRoll > botRoll;
                    description = `You bet HIGH (your roll > bot's roll)`;
                } else {
                    won = playerRoll < botRoll;
                    description = `You bet LOW (your roll < bot's roll)`;
                }

                if (playerRoll === botRoll) {
                    description += `\n🎲 It's a tie! Refunded.`;
                    await ctx.reply(
                        `🎲 *DICE DUEL*\n\n` +
                        `❯ Your roll: ${playerRoll}\n` +
                        `❯ Bot's roll: ${botRoll}\n\n` +
                        `${description}\n` +
                        `💰 Balance: ${currentCoins} coins (unchanged)`
                    );
                    return;
                }

                payout = won ? 10 : -10;
            } else if (guess >= 1 && guess <= 6) {
                // Number guess mode: bet on a specific number
                playerRoll = Math.floor(Math.random() * 6) + 1;
                won = playerRoll === guess;
                description = `You guessed ${guess}`;
                payout = won ? 50 : -10; // 5x payout for correct guess
            } else {
                // Default: simple roll, highest wins
                playerRoll = Math.floor(Math.random() * 6) + 1;
                botRoll = Math.floor(Math.random() * 6) + 1;
                won = playerRoll > botRoll;
                description = `Highest roll wins!`;
                payout = won ? 10 : -10;
            }

            senderDb.coin = currentCoins + payout;
            senderDb.save();

            let resultText = `🎲 *DICE DUEL*\n\n`;
            if (botRoll !== undefined) {
                resultText += `❯ Your roll: ${playerRoll}\n❯ Bot's roll: ${botRoll}\n`;
            } else {
                resultText += `❯ Roll: ${playerRoll}\n`;
            }
            resultText += `❯ ${description}\n\n`;
            resultText += won
                ? `🎉 You won! +${payout} coins\n`
                : `💸 You lost! ${payout} coins\n`;
            resultText += `💰 Balance: ${senderDb.coin} coins`;

            await ctx.reply(resultText);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
