module.exports = {
    name: "imagesearch",
    aliases: ["imgsearch", "image", "img"],
    category: "search",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "cute cats")}\n` +
                ctx.format.generateNotes(["Search for images and get results directly"])
            );

        try {
            // Try the siputzx image search API
            const apiUrl = ctx.api.createUrl("siputzx", "/api/search/image", { q: input });
            let res;
            try {
                res = (await axios.get(apiUrl, { timeout: 15000 })).data;
            } catch (e) {
                // Fallback to pinterest tool
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/search/pinterest", { q: input });
                res = (await axios.get(fallbackUrl, { timeout: 15000 })).data;
            }

            if (res.status === false || (!res.result && !res.data)) {
                return await ctx.reply(ctx.format.info(`No images found for "${input}".`));
            }

            const images = res.result || res.data || [];
            if (!Array.isArray(images) || images.length === 0) {
                return await ctx.reply(ctx.format.info(`No images found for "${input}".`));
            }

            // Send the first image
            const firstImage = typeof images[0] === "string" ? images[0] : images[0]?.url || images[0]?.image || images[0]?.thumbnail;

            if (!firstImage) {
                return await ctx.reply(ctx.format.info(`No images found for "${input}".`));
            }

            await ctx.reply({
                image: { url: firstImage },
                caption:
                    `🖼️ *IMAGE SEARCH*\n\n` +
                    `❯ ${ctx.format.bold("Query")}: ${input}\n` +
                    `❯ ${ctx.format.bold("Results")}: ${images.length} images found`,
                buttons: [
                    { text: "Next Image", id: `${ctx.used.prefix}${ctx.used.command} ${input}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
