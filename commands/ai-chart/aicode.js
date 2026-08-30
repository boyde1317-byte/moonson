const axios = require("axios");

module.exports = {
    name: "aicode",
    aliases: ["codeai", "codehelper", "aiprogrammer"],
    category: "ai-chat",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "Write a Python function to check if a number is prime")
            );
        }

        const senderDb = ctx.db.user;

        if (input.toLowerCase() === "reset") {
            if (!senderDb.sessionId) senderDb.sessionId = {};
            senderDb.sessionId.aicode = ctx.helper.randomUUID();
            senderDb.save();
            return await ctx.reply(tools.msg.info("Code session has been reset!"));
        }

        try {
            if (!senderDb.sessionId?.aicode) {
                if (!senderDb.sessionId) senderDb.sessionId = {};
                senderDb.sessionId.aicode = ctx.helper.randomUUID();
                senderDb.save();
            }

            // Use chatgpt-org with a coding-focused system prompt
            const prompt = `You are an expert programmer. Provide clean, well-commented code with explanations. Question: ${input}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/chatgpt-org", {
                teks: prompt,
                model: "openai/gpt-4o-mini",
                session: senderDb.sessionId.aicode
            });

            const { data } = await axios.get(apiUrl, { timeout: 45000 });

            let result = data.result || "No response received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 💻 AI Code Assistant\n\n` +
                    `**Request:** ${input}\n\n` +
                    `**Solution:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aicode`,
                    `${ctx.used.prefix}chatgpt`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
