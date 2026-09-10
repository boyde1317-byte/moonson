const axios = require("axios");

module.exports = {
    name: "pinterest",
    aliases: ["pin"],
    category: "tool",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "rei ayanami")}\n` +
                ctx.format.generateNotes([
                    "Search Pinterest for images by keyword",
                    "For downloading from a Pinterest URL, use .pinterestdl"
                ])
            );

        // If input is a URL, suggest using pinterestdl instead
        if (ctx.helper.isUrl(input)) {
            return await ctx.reply(
                ctx.format.info(
                    `It looks like you sent a Pinterest URL. Use ${ctx.format.inlineCode(`${ctx.used.prefix}pinterestdl`)} to download from a Pinterest link.\n\n` +
                    `Example: ${ctx.format.inlineCode(`${ctx.used.prefix}pinterestdl ${input}`)}`
                )
            );
        }

        try {
            // Primary API: nexray
            let images = [];
            let apiUsed = "nexray";

            try {
                const apiUrl = ctx.api.createUrl("nexray", "/search/pinterest", {
                    q: input
                });
                const response = await ctx.request.get(apiUrl);

                if (response?.data?.status !== false && response?.data?.result?.length > 0) {
                    images = response.data.result.map(item => item.images_url).filter(Boolean);
                }
            } catch (e) {
                apiUsed = "alwayscodex";
            }

            // Fallback API: alwayscodex
            if (images.length === 0) {
                try {
                    const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/search/pinterest", {
                        q: input
                    });
                    const fallbackRes = await ctx.request.get(fallbackUrl);

                    if (fallbackRes?.data?.status !== false && fallbackRes?.data?.result?.length > 0) {
                        images = fallbackRes.data.result.map(item => item.images_url || item).filter(Boolean);
                    }
                } catch (e) {
                    // Continue to error
                }
            }

            if (images.length === 0)
                return await ctx.reply(ctx.format.info(`No Pinterest images found for "${input}". Try a different keyword.`));

            const randomImage = ctx.helper.getRandomElement(images);

            await ctx.reply({
                image: {
                    url: randomImage
                },
                caption: `»› ${ctx.format.bold("Query")}: ${input}\n»› ${ctx.format.bold("Source")}: Pinterest`,
                buttons: [{
                    text: "Get Another",
                    id: `${ctx.used.prefix + ctx.used.command} ${input}`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
