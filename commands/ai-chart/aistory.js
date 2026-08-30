const axios = require("axios");

module.exports = {
    name: "aistory",
    aliases: ["story", "storyteller", "aistorygen"],
    category: "ai-chat",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "A robot discovering emotions for the first time") + "\n" +
                ctx.format.generateNotes([
                    "AI story generator",
                    "Provide a theme, setting, or prompt",
                    "Type 'reset' to start a new story"
                ])
            );
        }

        const senderDb = ctx.db.user;

        if (input.toLowerCase() === "reset") {
            if (!senderDb.sessionId) senderDb.sessionId = {};
            senderDb.sessionId.aistory = ctx.helper.randomUUID();
            senderDb.save();
            return await ctx.reply(tools.msg.info("Story session has been reset! Start fresh with a new prompt."));
        }

        try {
            if (!senderDb.sessionId?.aistory) {
                if (!senderDb.sessionId) senderDb.sessionId = {};
                senderDb.sessionId.aistory = ctx.helper.randomUUID();
                senderDb.save();
            }

            const prompt = `Write an engaging short story based on this prompt. Include vivid descriptions, dialogue, and a satisfying conclusion:\n\n${input}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/chatgpt-org", {
                teks: prompt,
                model: "openai/gpt-4o-mini",
                session: senderDb.sessionId.aistory
            });

            const { data } = await axios.get(apiUrl, { timeout: 45000 });

            let result = data.result || "No story received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 📖 AI Storyteller\n\n` +
                    `**Prompt:** ${input}\n\n` +
                    `**Story:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aistory`,
                    `${ctx.used.prefix}aipoem`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
