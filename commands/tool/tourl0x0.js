const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourl0x0",
    aliases: ["0x0", "0x0st", "tourl0x"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image", "video", "audio", "sticker", "document"]);
        const isQuoted = ctx.quoted && ctx.isMedia(["image", "video", "audio", "sticker", "document"], ["quoted"]);

        if (!isMedia && !isQuoted)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image", "video", "audio", "sticker", "document"])}\n` +
                ctx.format.generateNotes([
                    "Upload any media to 0x0.st",
                    "Returns a direct public URL",
                    "Files up to 512MB supported",
                    "Files expire after inactivity (varies)"
                ])
            );

        try {
            const buffer = await ctx.msg.download() || await ctx.quoted.download();

            if (!buffer)
                return await ctx.reply(ctx.format.info("Could not download the media. Please try again."));

            const mediaType = ctx.quoted?.type || ctx.msg?.type || "file";
            const extMap = {
                image: "jpg", video: "mp4", audio: "mp3",
                sticker: "webp", document: "bin"
            };
            const ext = extMap[mediaType] || "bin";
            const filename = `upload_${Date.now()}.${ext}`;

            const formData = new FormData();
            formData.append("file", buffer, { filename });

            const response = await axios.post("https://0x0.st", formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const result = (response.data || "").trim();

            if (result && result.startsWith("https://")) {
                await ctx.reply(
                    `🌐 *0X0.ST UPLOAD*\n\n` +
                    `❯ URL: ${result}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Hosting via 0x0.st_`,
                    { buttons: [{ text: "Open URL", id: result }] }
                );
            } else {
                await ctx.reply(ctx.format.info(`Upload failed: ${result || "Unknown error"}`));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
