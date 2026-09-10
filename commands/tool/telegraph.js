const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "telegraph",
    aliases: ["tgph", "tgraph", "telegraphup"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image"]);
        const isQuoted = ctx.quoted?.type === "image";

        if (!isMedia && !isQuoted)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image"])}\n` +
                ctx.format.generateNotes([
                    "Upload images to telegra.ph (permanent hosting)",
                    "Returns a direct public URL",
                    "Images only — for video/audio use .tourl"
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

            const filename = `upload_${Date.now()}.jpg`;
            const formData = new FormData();
            formData.append("file", buffer, { filename, contentType: "image/jpeg" });

            const response = await axios.post("https://telegra.ph/upload", formData, {
                headers: formData.getHeaders(),
                timeout: 30000
            });

            const data = response.data;

            if (data?.[0]?.src) {
                const url = `https://telegra.ph${data[0].src}`;

                await ctx.reply(
                    `📸 *TELEGRAPH UPLOAD*\n\n` +
                    `❯ URL: ${url}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Permanent image hosting via telegra.ph_`,
                    { buttons: [{ text: "Open URL", id: url }] }
                );
            } else if (data?.error) {
                await ctx.reply(ctx.format.info(`Upload failed: ${data.error}`));
            } else {
                await ctx.reply(ctx.format.info("Upload failed. Please try again."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
