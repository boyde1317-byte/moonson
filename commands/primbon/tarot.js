module.exports = {
    name: "tarot",
    aliases: ["tarotcard", "drawtarot"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        try {
            const apiUrl = "https://tarotapi.dev/api/v1/cards/random?n=1";
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.cards?.length)
                return await ctx.reply(ctx.format.info("The cards are shuffled but none came up. Try again."));

            const card = res.cards[0];
            const isMajor = card.type === "major";
            const cardType = isMajor ? "Major Arcana" : "Minor Arcana";

            const caption =
                "🃏 *TAROT READING*\n\n" +
                `❯ *Card*: ${card.name}\n` +
                `❯ *Type*: ${cardType}\n` +
                (isMajor ? `❯ *Number*: ${card.value}\n` : "") +
                `\n📖 *Meaning (Upright)*\n${card.meaning_up}\n\n` +
                `🔄 *Meaning (Reversed)*\n${card.meaning_rev}\n\n` +
                `🎴 ${ctx.format.bold("The cards have spoken")}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
