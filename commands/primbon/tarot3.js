module.exports = {
    name: "tarot3",
    aliases: ["tarotspread", "tarot3card"],
    category: "primbon",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        try {
            const apiUrl = "https://tarotapi.dev/api/v1/cards/random?n=3";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.cards?.length)
                return await ctx.reply(ctx.format.info("The cards refused to reveal themselves. Try again."));

            const positions = ["🔮 Past", "💫 Present", "🌟 Future"];
            let caption = "🃏 *THREE-CARD TAROT SPREAD*\n\n";

            res.cards.forEach((card, i) => {
                caption +=
                    `${positions[i]}\n` +
                    `❯ *Card*: ${card.name}\n` +
                    `❯ ${card.meaning_up}\n\n`;
            });

            caption += `🎴 ${ctx.format.bold("Past • Present • Future")}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
