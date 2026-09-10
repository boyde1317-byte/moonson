const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourluuu",
    aliases: ["uuu", "tourluuu", "uuuupload"],
    category: "tool",
    permissions: {
        coin: 2
    },

    code: async (ctx) => {
        const isMedia = ctx.isMedia(["image", "video", "audio", "sticker", "document"]);
        const isQuoted = ctx.quoted && ctx.isMedia(["image", "video", "audio", "sticker", "document"], ["quoted"]);

        if (!isMedia && !isQuoted)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["image", "video", "audio", "sticker", "document"])}\n` +
                ctx.format.generateNotes([
                    "Upload any media to uuu.sh",
                    "Returns a direct public URL",
                    "Temporary hosting (files expire after some time)"
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
            formData.append("files[]", buffer, { filename });

            const response = await axios.post("https://uuu.sh/upload", formData, {
                headers: formData.getHeaders(),
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const data = response.data;

            if (data?.files?.[0]?.url) {
                const url = data.files[0].url;
                await ctx.reply(
                    `🌐 *UUU.SH UPLOAD*\n\n` +
                    `❯ URL: ${url}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Hosting via uuu.sh_`,
                    { buttons: [{ text: "Open URL", id: url }] }
                );
            } else {
                await ctx.reply(ctx.format.info("Upload failed. Please try again."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
