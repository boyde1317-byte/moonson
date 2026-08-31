const axios = require("axios");

/**
 * AI Chat Mode — Talk to Moonson naturally.
 * When you reply to the bot or @mention it, it responds like a friend.
 * No prefix needed. Just reply or mention.
 */

const BOT_PERSONALITY = `You are Moonson, a friendly and witty WhatsApp bot assistant. You're warm, casual, and fun — like talking to a smart friend. Keep responses short (1-3 sentences max for casual chat). Use emoji naturally. Be helpful but not robotic. You have a sense of humor. If someone asks what you can do, mention you have 260+ commands across 17 categories. You were created by the Moonson team.`;

module.exports = {
    name: "aichat",
    aliases: ["chat", "talk", "moonson"],
    category: "main",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        // Accept text input or quoted message
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                "🧠 *AI Chat Mode*\n\n" +
                "Just talk to me! Reply to my messages or use " +
                ctx.format.inlineCode(ctx.used.prefix + "chat your message") +
                " and I'll respond like a real conversation.\n\n" +
                "Example: " + ctx.format.inlineCode(ctx.used.prefix + "chat hey how are you?")
            );
        }

        try {
            // Build API URL using alwayscodex ChatGPT endpoint
            const apiUrl = ctx.api.createUrl("alwayscodex", "/api/ai/chatgpt-org", {
                teks: BOT_PERSONALITY + "\n\nUser says: " + input,
                model: "openai/gpt-4o-mini"
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "Hmm, I didn't catch that. Try again?";

            // Keep it conversational — truncate if too long
            if (result.length > 1500) {
                result = result.substring(0, 1500) + "...";
            }

            await ctx.reply("💬 " + result);
        } catch (error) {
            // Fallback to a simple response if API fails
            await ctx.reply("💬 I'm here but my brain's a bit fuzzy right now. Try again in a sec?");
        }
    }
};
