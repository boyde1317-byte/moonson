module.exports = {
    name: "currency",
    aliases: ["convert", "fx", "exchange"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text?.trim();

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "100 USD to GHS")}\n` +
                ctx.format.generateNotes([
                    "Convert between any world currencies",
                    "Format: amount from_currency to_currency",
                    "Example: .currency 50 EUR to USD"
                ])
            );

        try {
            // Parse: "100 USD to GHS" or "100 USD GHS" or "100usdtoghs"
            const match = input.match(/(\d+(?:\.\d+)?)\s+([A-Za-z]{3})\s*(?:to\s+)?([A-Za-z]{3})/i);

            if (!match) {
                return await ctx.reply(
                    ctx.format.info("Invalid format! Use: amount from_currency to_currency\nExample: 100 USD to GHS")
                );
            }

            const amount = parseFloat(match[1]);
            const from = match[2].toUpperCase();
            const to = match[3].toUpperCase();

            if (isNaN(amount) || amount <= 0) {
                return await ctx.reply(ctx.format.info("Amount must be a positive number!"));
            }

            // Exchange Rate API — free, no key needed (open.er-api.com)
            const apiUrl = `https://open.er-api.com/v6/latest/${from}`;
            const res = (await axios.get(apiUrl, { timeout: 15000 })).data;

            if (res.result !== "success" || !res.rates) {
                return await ctx.reply(ctx.format.info(`Could not fetch exchange rate for ${from}.`));
            }

            const rate = res.rates[to];
            if (!rate) {
                return await ctx.reply(ctx.format.info(`Exchange rate from ${from} to ${to} is not available.`));
            }

            const converted = (amount * rate).toFixed(2);
            const rateFormatted = rate.toFixed(4);

            // Get flag emojis
            const getFlag = (code) => {
                if (code.length !== 3) return "";
                const flags = {
                    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", GHS: "🇬🇭", NGN: "🇳🇬", KES: "🇰🇪",
                    ZAR: "🇿🇦", JPY: "🇯🇵", CNY: "🇨🇳", INR: "🇮🇳", AUD: "🇦🇺", CAD: "🇨🇦",
                    CHF: "🇨🇭", SGD: "🇸🇬", AED: "🇦🇪", BTC: "₿", ETH: "Ξ"
                };
                return flags[code] || "";
            };

            const fromFlag = getFlag(from);
            const toFlag = getFlag(to);

            return await ctx.reply({
                text:
                    `💱 *CURRENCY CONVERTER*\n\n` +
                    `${fromFlag} ${ctx.format.bold(amount.toLocaleString("en-US") + " " + from)}\n` +
                    `= ${ctx.format.bold(converted + " " + to)} ${toFlag}\n\n` +
                    `❯ ${ctx.format.bold("Rate")}: 1 ${from} = ${rateFormatted} ${to}\n` +
                    `❯ ${ctx.format.bold("Updated")}: ${res.time_last_update_utc || "N/A"}`,
                buttons: [
                    { text: "Reverse", id: `${ctx.used.prefix}${ctx.used.command} ${converted} ${to} to ${from}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
