const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourl",
    aliases: ["catbox", "tourlcat", "uploadurl"],
    category: "tool",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image", "video", "audio", "sticker", "document"]);
        const isQuoted = ctx.quoted && ctx.isMedia(["image", "video", "audio", "sticker", "document"], ["quoted"]);

        if (!isMedia && !isQuoted)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image", "video", "audio", "sticker", "document"])}\n` +
                ctx.format.generateNotes([
                    "Upload any media to catbox.moe (permanent hosting)",
                    "Returns a direct public URL",
                    "Files up to 200MB supported"
                ])
            );

        try {
            // Download the media buffer
            const buffer = await ctx.msg.download() || await ctx.quoted.download();

            if (!buffer)
                return await ctx.reply(ctx.format.info("Could not download the media. Please try again."));

            // Determine file extension from media type
            const mediaType = ctx.quoted?.type || ctx.msg?.type || "file";
            const extMap = {
                image: "jpg", video: "mp4", audio: "mp3",
                sticker: "webp", document: "bin"
            };
            const ext = extMap[mediaType] || "bin";
            const filename = `upload_${Date.now()}.${ext}`;

            // Upload to catbox.moe
            const formData = new FormData();
            formData.append("reqtype", "fileupload");
            formData.append("fileToUpload", buffer, { filename });

            const response = await axios.post("https://catbox.moe/user/api.php", formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const result = response.data;

            if (result && result.startsWith("https://")) {
                await ctx.reply(
                    `🌐 *CATBOX UPLOAD*\n\n` +
                    `❯ URL: ${result}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Permanent hosting via catbox.moe_`,
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
