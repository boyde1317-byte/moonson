const axios = require("axios");

module.exports = {
    name: "aipoem",
    aliases: ["poem", "poetry", "aipoetry"],
    category: "ai-chat",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "the beauty of a sunrise over the ocean") + "\n" +
                ctx.format.generateNotes([
                    "AI poem generator",
                    "Provide a theme, emotion, or subject",
                    "Optionally specify style: haiku, sonnet, free verse"
                ])
            );
        }

        try {
            // Detect style from input
            let style = "free verse";
            const styles = ["haiku", "sonnet", "limerick", "free verse", "acrostic", "rhyming"];
            const styleMatch = styles.find(s => input.toLowerCase().includes(s));
            if (styleMatch) style = styleMatch;

            const prompt = `Write a beautiful ${style} poem about: ${input}. Make it evocative and memorable.`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/deepseek", {
                teks: prompt,
                session: ctx.helper.randomUUID()
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No poem received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 🎭 AI Poet\n\n` +
                    `**Theme:** ${input}\n` +
                    `**Style:** ${style}\n\n` +
                    `${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aipoem`,
                    `${ctx.used.prefix}aistory`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
