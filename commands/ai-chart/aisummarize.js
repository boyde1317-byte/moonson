const axios = require("axios");

module.exports = {
    name: "aisummarize",
    aliases: ["summarize", "tldr", "ai-summary"],
    category: "ai-chat",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send", "reply"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "Paste a long article or reply to a long message") + "\n" +
                ctx.format.generateNotes([
                    "AI-powered text summarization",
                    "Maximum 5000 characters",
                    "Type 'reset' to clear session"
                ])
            );
        }

        const senderDb = ctx.db.user;

        if (input.toLowerCase() === "reset") {
            if (!senderDb.sessionId) senderDb.sessionId = {};
            senderDb.sessionId.aisummarize = ctx.helper.randomUUID();
            senderDb.save();
            return await ctx.reply(tools.msg.info("Summary session has been reset!"));
        }

        if (input.length > 5000)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 5000 characters."));

        try {
            if (!senderDb.sessionId?.aisummarize) {
                if (!senderDb.sessionId) senderDb.sessionId = {};
                senderDb.sessionId.aisummarize = ctx.helper.randomUUID();
                senderDb.save();
            }

            const prompt = `Summarize the following text in a clear, concise manner. Use bullet points for key takeaways:\n\n${input}`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/deepseek", {
                teks: prompt,
                session: senderDb.sessionId.aisummarize
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No summary received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 📝 AI Summarizer\n\n` +
                    `**Summary:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aisummarize`,
                    `${ctx.used.prefix}aicode`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
