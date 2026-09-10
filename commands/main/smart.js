const { detectIntent, detectPlatform, extractUrl } = require("../../lib/smartRouter");

module.exports = {
    name: "smart",
    aliases: ["smartrouter", "nlr", "intent"],
    category: "main",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input) {
            return await ctx.reply(
                "🧠 *SMART ROUTER*\n\n" +
                "Moonson's Natural Language Router lets you trigger commands by just *talking naturally* — no prefix needed.\n\n" +
                "*Examples:*\n" +
                "❯ Paste a YouTube link → bot offers to download\n" +
                "❯ \"what is quantum physics\" → bot offers to search\n" +
                "❯ \"weather in Tokyo\" → bot offers weather\n" +
                "❯ \"translate hello\" → bot offers to translate\n" +
                "❯ Reply to image + \"sticker\" → bot offers to stickerize\n" +
                "❯ \"horoscope for leo\" → bot offers horoscope\n" +
                "❯ \"tarot reading\" → bot offers to draw cards\n\n" +
                "Type " + ctx.format.inlineCode(ctx.used.prefix + "smart <message>") + " to test intent detection on any text."
            );
        }

        // Test intent detection
        const platform = detectPlatform(input);
        const url = extractUrl(input);
        const intent = detectIntent(input, null, ctx.used.prefix);

        let caption = "🧠 *SMART ROUTER — INTENT ANALYSIS*\n\n";
        caption += `❯ *Input*: "${input}"\n`;
        caption += `❯ *URL detected*: ${url || "None"}\n`;
        caption += `❯ *Platform*: ${platform || "None"}\n`;
        caption += `❯ *Intent*: ${intent ? intent.type : "No intent detected"}\n`;
        if (intent) {
            caption += `❯ *Command*: ${intent.command}\n`;
            if (intent.buttons) {
                caption += `\n*Would offer ${intent.buttons.length} buttons:*`;
                intent.buttons.forEach((btn, i) => {
                    if (btn.id !== "ignore") {
                        caption += `\n${i + 1}. ${btn.text} → ${btn.id}`;
                    }
                });
            }
        }

        await ctx.reply(caption);
    }
};
