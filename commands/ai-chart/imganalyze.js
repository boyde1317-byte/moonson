const axios = require("axios");

module.exports = {
    name: "imganalyze",
    aliases: ["describe", "vision", "imgai", "analyzeimg"],
    category: "ai-chat",
    permissions: {
        coin: 15
    },

    code: async (ctx) => {
        const input = ctx.text;
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "What's in this picture? (reply to image)")}\n` +
                ctx.format.generateNotes([
                    "AI vision: analyze and describe any image",
                    "Optional: add a specific question about the image"
                ])
            );

        try {
            let uploadUrl;
            if (isMedia) {
                uploadUrl = await ctx.msg.upload();
            } else {
                uploadUrl = await ctx.quoted.upload();
            }

            if (!uploadUrl)
                return await ctx.reply(ctx.format.info("Could not upload the image. Please try again."));

            const question = input || "Describe this image in detail.";

            // Try nexray AI vision endpoint
            let result;
            try {
                const apiUrl = ctx.api.createUrl("nexray", "/ai/vision", {
                    url: uploadUrl,
                    text: question
                });
                const response = await axios.get(apiUrl, { timeout: 30000 });
                result = response.data?.result || response.data?.data || "No analysis received.";
            } catch (e) {
                // Fallback: alwayscodex gemini vision
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/ai/gemini-pro", {
                    teks: `${question}\n\nImage: ${uploadUrl}`,
                    session: ctx.helper.randomUUID()
                });
                const fallbackResponse = await axios.get(fallbackUrl, { timeout: 30000 });
                result = fallbackResponse.data?.result || "No analysis received.";
            }

            if (result.length > 3500) {
                result = result.substring(0, 3500) + "\n\n_... (truncated)_";
            }

            await new AIRich(ctx.core)
                .addText(
                    `# 👁️ AI Vision\n\n` +
                    `**Question:** ${question}\n\n` +
                    `**Analysis:** ${result}\n\n` +
                    `[](https://wa.me/${config.owner.id})`
                )
                .addTip("_Powered by Moonson Aizen — ai system_")
                .addSuggest([
                    `${ctx.used.prefix}imganalyze`,
                    `${ctx.used.prefix}chatgpt`,
                    `${ctx.used.prefix}menu ai-chat`
                ])
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
