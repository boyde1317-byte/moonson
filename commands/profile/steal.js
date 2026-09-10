module.exports = {
    name: "steal",
    aliases: ["rob", "pickpocket", "mug"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const target = await ctx.target();
        const senderDb = ctx.db.user;

        if (ctx.sender.isOwner() || senderDb?.premium)
            return await ctx.reply(ctx.format.info("Premium users and owners have unlimited coins — no need to steal!"));

        if (!target?.jid)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "@user")}\n` +
                ctx.format.generateNotes([
                    "Try to steal coins from another user",
                    "Success rate: 35% | Fail penalty: -15 coins",
                    "Cannot steal from owners or premium users"
                ])
            );

        // Can't steal from yourself
        if (ctx.helper.areJidsSameUser(target.jid, ctx.sender.jid))
            return await ctx.reply(ctx.format.info("You can't steal from yourself!"));

        // Can't steal from owner or premium
        const targetDb = ctx.db.users.get(target.jid);
        if (ctx.sender.isOwner(target.jid) || targetDb?.premium)
            return await ctx.reply(ctx.format.info("You can't steal from the owner or premium users!"));

        const currentCoins = senderDb?.coin || 0;

        if (currentCoins < 15)
            return await ctx.reply(ctx.format.info(`You need at least 15 coins to attempt a steal! You have ${currentCoins} coins.`));

        try {
            const targetCoins = targetDb?.coin || 0;
            const success = Math.random() < 0.35; // 35% success rate

            if (success) {
                // Steal 10-30% of target's coins, minimum 5, maximum 100
                const stealPercent = 0.1 + Math.random() * 0.2; // 10-30%
                let stolen = Math.round(targetCoins * stealPercent);
                stolen = Math.min(Math.max(stolen, 5), 100);

                senderDb.coin = currentCoins + stolen;
                senderDb.save();

                if (targetDb) {
                    targetDb.coin = Math.max(0, targetCoins - stolen);
                    targetDb.save();
                }

                await ctx.reply(
                    `🦹 *STEAL SUCCESS*\n\n` +
                    `❯ Target: @${ctx.getId(target.jid)}\n` +
                    `❯ Stolen: ${stolen} coins\n\n` +
                    `💰 Your balance: ${senderDb.coin} coins`,
                    { mentions: [target.jid] }
                );
            } else {
                // Failed: lose 15 coins
                senderDb.coin = currentCoins - 15;
                senderDb.save();

                await ctx.reply(
                    `🚔 *STEAL FAILED*\n\n` +
                    `❯ Target: @${ctx.getId(target.jid)}\n` +
                    `❯ You got caught! Penalty: -15 coins\n\n` +
                    `💰 Your balance: ${senderDb.coin} coins`,
                    { mentions: [target.jid] }
                );
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
