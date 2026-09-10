const axios = require("axios");

module.exports = {
    name: "aiproofread",
    aliases: ["proofread", "grammar", "fixgrammar", "aigrammar"],
    category: "ai-chat",
    permissions: {
        coin: 8
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                `${tools.msg.generateInstruction(["send", "reply"], ["text"])}\n` +
                tools.msg.generateCmdExample(ctx.used, "i think that their is a problem with this sentance") + "\n" +
                ctx.format.generateNotes([
                    "AI-powered grammar and proofreading",
                    "Fixes spelling, grammar, and style",
                    "Maximum 2000 characters"
                ])
            );
        }

        if (input.length > 2000)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 2000 characters."));

        try {
            const prompt = `Proofread and correct the following text. Show the corrected version, then list the changes made:\n\n"${input}"`;
            const apiUrl = tools.api.createUrl("alwayscodex", "/api/ai/deepseek", {
                teks: prompt,
                session: ctx.helper.randomUUID()
            });

            const { data } = await axios.get(apiUrl, { timeout: 30000 });

            let result = data.result || "No corrections received.";

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# ✍️ AI Proofreader\n\n` +
                    `**Original:**\n${input}\n\n` +
                    `**Corrections:**\n${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}aiproofread`,
                    `${ctx.used.prefix}aisummarize`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await tools.cmd.handleError(ctx, error, true);
        }
    }
};
