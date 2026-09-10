const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourltmp",
    aliases: ["litterbox", "tmpurl", "tourllitter"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;
        const isMedia = ctx.isMedia(["image", "video", "audio", "sticker", "document"]);
        const isQuoted = ctx.quoted && ctx.isMedia(["image", "video", "audio", "sticker", "document"], ["quoted"]);

        if (!isMedia && !isQuoted)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image", "video", "audio", "sticker", "document"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "72h (reply to media)")}\n` +
                ctx.format.generateNotes([
                    "Upload to litterbox (temporary hosting)",
                    "Expiry options: 1h, 12h, 24h, 72h",
                    "Default: 72h"
                ])
            );

        // Parse expiry time
        let expiry = "72h";
        if (input) {
            const match = input.match(/^(\d+)(h|hr|hrs|hours)$/i);
            if (match) {
                const hours = parseInt(match[1]);
                if ([1, 12, 24, 72].includes(hours)) {
                    expiry = `${hours}h`;
                }
            }
        }
        const apiTime = expiry.replace("h", "");
        const apiTimeMap = { "1": "1h", "12": "12h", "24": "24h", "72": "72h" };
        const litterTime = apiTimeMap[apiTime] || "72h";

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
            const filename = `tmp_${Date.now()}.${ext}`;

            // Upload to litterbox
            const formData = new FormData();
            formData.append("reqtype", "fileupload");
            formData.append("time", litterTime);
            formData.append("fileToUpload", buffer, { filename });

            const response = await axios.post("https://litterbox.catbox.moe/resources/internals/api.php", formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const result = response.data;

            if (result && result.startsWith("https://")) {
                await ctx.reply(
                    `🌐 *LITTERBOX UPLOAD*\n\n` +
                    `❯ URL: ${result}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n` +
                    `❯ Expires: ${expiry}\n\n` +
                    `_Temporary hosting via litterbox.catbox.moe_`,
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
