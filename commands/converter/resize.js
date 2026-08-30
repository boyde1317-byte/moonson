module.exports = {
    name: "resize",
    aliases: ["imgresize", "resizeimg", "scale"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;
        const isMedia = ctx.isMedia(["image", "sticker"]);
        const isQuotedImage = ctx.quoted?.type === "image" || ctx.quoted?.type === "sticker";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "512x512 (reply to image)")}\n` +
                ctx.format.generateNotes([
                    "Resize an image to custom dimensions",
                    "Format: WIDTHxHEIGHT (e.g. 800x600)",
                    "If only one number, resizes to square"
                ])
            );

        // Parse dimensions
        let width = 512, height = 512;
        if (input) {
            const match = input.match(/(\d+)[x×](\d+)/i);
            const single = input.match(/^(\d+)$/);
            if (match) {
                width = parseInt(match[1]);
                height = parseInt(match[2]);
            } else if (single) {
                width = parseInt(single[1]);
                height = parseInt(single[1]);
            }
        }

        // Clamp values
        width = Math.min(Math.max(width, 16), 4096);
        height = Math.min(Math.max(height, 16), 4096);

        try {
            let uploadUrl;
            if (isMedia) {
                uploadUrl = await ctx.msg.upload();
            } else {
                uploadUrl = await ctx.quoted.upload();
            }

            if (!uploadUrl)
                return await ctx.reply(ctx.format.info("Could not upload the image. Please try again."));

            // Try nexray resize endpoint
            const apiUrl = ctx.api.createUrl("nexray", "/converter/resize", {
                url: uploadUrl,
                width,
                height
            });

            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: try siputzx
                const fallbackUrl = ctx.api.createUrl("siputzx", "/api/canvas/resize", {
                    url: uploadUrl,
                    width,
                    height
                });
                result = (await ctx.request.get(fallbackUrl)).data?.result || fallbackUrl;
            }

            await ctx.reply({
                image: { url: typeof result === "string" ? result : result?.url },
                caption:
                    `📐 *IMAGE RESIZE*\n\n` +
                    `❯ ${ctx.format.bold("Dimensions")}: ${width}x${height}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
