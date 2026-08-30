const axios = require("axios");

module.exports = {
    name: "aiprompt",
    aliases: ["promptgen", "promptmaker", "promptenhancer"],
    category: "ai-chat",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "a cyberpunk city at night") + "\n" +
                ctx.format.generateNotes([
                    "AI prompt enhancer",
                    "Turns simple ideas into detailed AI prompts",
                    "Great for use with .aiimage or .flux"
                ])
            );
        }

        try {
            const prompt = `Enhance this AI image generation prompt into a detailed, vivid description. Add artistic style, lighting, mood, composition, and quality modifiers. Return only the enhanced prompt:\n\n${input}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/chatgpt-org", {
                teks: prompt,
                model: "openai/gpt-4o-mini",
                session: ctx.helper.randomUUID()
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No prompt generated.";

            if (result.length > 2000) {
                result = result.substring(0, 2000);
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 🎨 AI Prompt Enhancer\n\n` +
                    `**Original:** ${input}\n\n` +
                    `**Enhanced Prompt:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Use this enhanced prompt with .aiimage or .flux_")
                .addButtons([
                    { text: "Generate Image", id: `${ctx.used.prefix}aiimage ${result.substring(0, 200)}` },
                    { text: "Flux Image", id: `${ctx.used.prefix}flux ${result.substring(0, 200)}` }
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
