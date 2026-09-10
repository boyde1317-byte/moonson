module.exports = {
    name: "shop",
    aliases: ["store", "buy", "purchase"],
    category: "profile",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text?.toLowerCase().trim();
        const senderDb = ctx.db.user;

        const shopItems = {
            // Perks
            customtitle: {
                name: "Custom Title",
                description: "Set a custom title on your profile",
                price: 500,
                level: 5
            },
            coloredname: {
                name: "Colored Name",
                description: "Your name appears colored on the leaderboard",
                price: 1000,
                level: 15
            },
            luckboost: {
                name: "Luck Boost",
                description: "+10% win rate on coinflip and dice for 24 hours",
                price: 300,
                level: 10
            },
            coinshield: {
                name: "Coin Shield",
                description: "Protect your coins from stealing for 48 hours",
                price: 200,
                level: 8
            },
            xpboost: {
                name: "XP Boost",
                description: "Double XP from games for 24 hours",
                price: 400,
                level: 12
            },
            premium: {
                name: "Premium (3 days)",
                description: "Unlimited coins for 3 days",
                price: 2000,
                level: 20
            }
        };

        // No input: show shop
        if (!input) {
            let shopText = "🛒 *COIN SHOP*\n\n_Buy perks with your coins!_\n\n";

            for (const [id, item] of Object.entries(shopItems)) {
                shopText += `❯ ${ctx.format.bold(item.name)} — ${item.price} coins\n   ${item.description}\n   _Requires Level ${item.level}_\n\n`;
            }

            shopText += `_Usage: ${ctx.used.prefix}${ctx.used.command} <item_id>_\n`;
            shopText += `_Example: ${ctx.used.prefix}${ctx.used.command} luckboost_`;

            return await ctx.reply(shopText);
        }

        // Try to buy
        if (input === "list") {
            let shopText = "🛒 *COIN SHOP*\n\n";
            for (const [id, item] of Object.entries(shopItems)) {
                shopText += `❯ ${ctx.format.bold(id)} — ${item.price} coins — ${item.name}\n`;
            }
            return await ctx.reply(shopText);
        }

        const item = shopItems[input];
        if (!item)
            return await ctx.reply(ctx.format.info(`Item not found! Type ${ctx.used.prefix}${ctx.used.command} to see the shop.`));

        const level = senderDb?.level || 0;
        if (level < item.level)
            return await ctx.reply(ctx.format.info(`You need Level ${item.level} to buy this! You are Level ${level}.`));

        const currentCoins = senderDb?.coin || 0;
        if (currentCoins < item.price)
            return await ctx.reply(ctx.format.info(`You need ${item.price} coins! You have ${currentCoins} coins.`));

        try {
            // Deduct coins
            senderDb.coin = currentCoins - item.price;

            // Apply perk
            const perks = senderDb.perks || {};
            const now = Date.now();

            switch (input) {
                case "luckboost":
                    perks.luckBoost = now + (24 * 60 * 60 * 1000);
                    break;
                case "coinshield":
                    perks.coinShield = now + (48 * 60 * 60 * 1000);
                    break;
                case "xpboost":
                    perks.xpBoost = now + (24 * 60 * 60 * 1000);
                    break;
                case "customtitle":
                    perks.customTitle = true;
                    break;
                case "coloredname":
                    perks.coloredName = true;
                    break;
                case "premium":
                    senderDb.premium = true;
                    perks.premiumExpiry = now + (3 * 24 * 60 * 60 * 1000);
                    break;
            }

            senderDb.perks = perks;
            senderDb.save();

            await ctx.reply(
                `✅ *PURCHASE SUCCESS*\n\n` +
                `❯ Item: ${item.name}\n` +
                `❯ Price: ${item.price} coins\n` +
                `❯ Balance: ${senderDb.coin} coins\n\n` +
                `${item.description}`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
