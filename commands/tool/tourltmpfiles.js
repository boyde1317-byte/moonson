const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourltmpfiles",
    aliases: ["tmpfiles", "tmpfilesupload", "tourltf"],
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
                    "Upload any media to tmpfiles.org",
                    "Returns a direct public URL",
                    "Temporary hosting (no guaranteed expiry)"
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

            const response = await axios.post("https://tmpfiles.org/api/v1/upload", formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const data = response.data;

            if (data?.data?.url) {
                // Convert tmpfiles.org URL to direct download URL
                const directUrl = data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
                await ctx.reply(
                    `🌐 *TMPFILES UPLOAD*\n\n` +
                    `❯ URL: ${directUrl}\n` +
                    `❯ Page: ${data.data.url}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Temporary hosting via tmpfiles.org_`,
                    { buttons: [{ text: "Open URL", id: directUrl }] }
                );
            } else {
                await ctx.reply(ctx.format.info("Upload failed. Please try again."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
