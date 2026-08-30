const axios = require("axios");

module.exports = {
    name: "aitranslate",
    aliases: ["aitrans", "smarttranslate", "aitranslation"],
    category: "ai-chat",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send", "reply"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "Hello world | French") + "\n" +
                ctx.format.generateNotes([
                    "AI-powered translation with context awareness",
                    "Format: text | target language",
                    "Better than standard translation — understands nuance"
                ])
            );
        }

        try {
            let [text, targetLang] = input.split("|").map(s => s?.trim());

            if (!text) return await ctx.reply(ctx.format.info("Please provide text to translate!"));

            if (!targetLang) {
                // Try to detect language from the text itself
                targetLang = "English";
            }

            const prompt = `Translate the following text into ${targetLang}. Maintain the original tone and meaning. Only return the translation:\n\n${text}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/deepseek", {
                teks: prompt,
                session: ctx.helper.randomUUID()
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No translation received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 🌐 AI Translator\n\n` +
                    `**Source:** ${text}\n` +
                    `**Target:** ${targetLang}\n\n` +
                    `**Translation:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aitranslate`,
                    `${ctx.used.prefix}translate`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
