module.exports = {
    name: "crypto",
    aliases: ["coinprice", "cryptoprice", "coin"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text?.toLowerCase().trim();

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "bitcoin")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "btc ethereum")}\n` +
                ctx.format.generateNotes([
                    "Get live cryptocurrency prices",
                    "Use coin name (bitcoin) or symbol (btc)",
                    "Multiple coins supported, space-separated"
                ])
            );

        try {
            const coins = input.split(/\s+/).filter(Boolean);
            const coinMap = {
                btc: "bitcoin", eth: "ethereum", sol: "solana", xrp: "ripple",
                ada: "cardano", doge: "dogecoin", dot: "polkadot", matic: "matic-network",
                avax: "avalanche-2", link: "chainlink", uni: "uniswap", atom: "cosmos",
                ltc: "litecoin", bnb: "binancecoin", trx: "tron", etc: "ethereum-classic",
                usdt: "tether", usdc: "usd-coin", shib: "shiba-inu", pepe: "pepe"
            };

            const coinIds = coins.map(c => coinMap[c] || c);
            const idsParam = coinIds.join(",");

            // CoinGecko API — free, no key needed
            const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(idsParam)}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
            const res = (await axios.get(apiUrl, { timeout: 15000 })).data;

            if (!Array.isArray(res) || res.length === 0) {
                return await ctx.reply(ctx.format.info(`No cryptocurrency data found for "${input}".`));
            }

            let text = `💰 *CRYPTO PRICES*\n\n`;

            res.forEach((coin, i) => {
                const change = coin.price_change_percentage_24h;
                const arrow = change >= 0 ? "📈" : "📉";
                const changeStr = change ? `${arrow} ${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "N/A";

                text += `${ctx.format.bold(`${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()})`)}\n`;
                text += `   ❯ ${ctx.format.bold("Price")}: $${coin.current_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}\n`;
                text += `   ❯ ${ctx.format.bold("24h Change")}: ${changeStr}\n`;
                text += `   ❯ ${ctx.format.bold("Market Cap")}: $${coin.market_cap?.toLocaleString("en-US") || "N/A"}\n`;
                text += `   ❯ ${ctx.format.bold("24h Volume")}: $${coin.total_volume?.toLocaleString("en-US") || "N/A"}\n`;
                text += `   ❯ ${ctx.format.bold("High 24h")}: $${coin.high_24h?.toLocaleString("en-US") || "N/A"}\n`;
                text += `   ❯ ${ctx.format.bold("Low 24h")}: $${coin.low_24h?.toLocaleString("en-US") || "N/A"}\n\n`;
            });

            await ctx.reply(text.trim());
        } catch (error) {
            if (error.response?.status === 429) {
                return await ctx.reply(ctx.format.info("Rate limited by CoinGecko. Please wait a moment and try again."));
            }
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
