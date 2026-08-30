const axios = require("axios");

module.exports = {
    name: "aiexplain",
    aliases: ["explain", "eli5", "simply"],
    category: "ai-chat",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send", "reply"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "How does blockchain work?") + "\n" +
                ctx.format.generateNotes([
                    "AI explains anything in simple terms",
                    "Like ELI5 (Explain Like I'm 5)",
                    "Great for complex topics"
                ])
            );
        }

        const senderDb = ctx.db.user;

        if (input.toLowerCase() === "reset") {
            if (!senderDb.sessionId) senderDb.sessionId = {};
            senderDb.sessionId.aiexplain = ctx.helper.randomUUID();
            senderDb.save();
            return await ctx.reply(tools.msg.info("Explanation session has been reset!"));
        }

        try {
            if (!senderDb.sessionId?.aiexplain) {
                if (!senderDb.sessionId) senderDb.sessionId = {};
                senderDb.sessionId.aiexplain = ctx.helper.randomUUID();
                senderDb.save();
            }

            const prompt = `Explain the following in simple, easy-to-understand terms. Use everyday analogies and avoid jargon. Topic: ${input}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/chatgpt-org", {
                teks: prompt,
                model: "openai/gpt-4o-mini",
                session: senderDb.sessionId.aiexplain
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No explanation received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 💡 AI Explainer\n\n` +
                    `**Topic:** ${input}\n\n` +
                    `**Explanation:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aiexplain`,
                    `${ctx.used.prefix}chatgpt`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
