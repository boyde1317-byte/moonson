const WASF = require("wa-sticker-formatter");

module.exports = {
    name: "img2sticker",
    aliases: ["i2s", "image2sticker", "photosticker"],
    category: "converter",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;
        const isMedia = ctx.isMedia(["image"]);
        const isQuotedImage = ctx.quoted?.type === "image";

        if (!isMedia && !isQuotedImage)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "pack name|author name")}\n` +
                ctx.format.generateNotes([
                    "Convert any image to a sticker with custom pack/author",
                    "Optional: provide pack|author name",
                    "For animated stickers use .sticker with a video/GIF"
                ])
            );

        try {
            let buffer;
            if (isMedia) {
                buffer = await ctx.msg.download();
            } else {
                buffer = await ctx.quoted.download();
            }

            if (!buffer)
                return await ctx.reply(ctx.format.info("Could not download the image. Please try again."));

            // Parse pack and author from input
            let [packname, author] = input?.split("|").map(s => s?.trim());

            // Create sticker using wa-sticker-formatter
            const sticker = new WASF.Sticker(buffer, {
                pack: packname || config.sticker.packname,
                author: author || config.sticker.author,
                type: WASF.StickerType.FULL,
                quality: 70,
                categories: ["🤖", "🎨"]
            });

            const stickerBuffer = await sticker.toBuffer();

            await ctx.reply({
                sticker: stickerBuffer
            }, {
                pack: packname || config.sticker.packname,
                author: author || config.sticker.author
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
