const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "tourlfilebin",
    aliases: ["filebin", "filebinupload", "tourlfb"],
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
                    "Upload any media to filebin.net",
                    "Returns a public bin URL",
                    "Files organized in bins (collections)"
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

            // Generate random bin name
            const binName = `moonson${Date.now().toString(36)}`;
            const formData = new FormData();
            formData.append("file", buffer, { filename });

            const response = await axios.post(`https://filebin.net/${binName}`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    "Accept": "application/json"
                },
                timeout: 60000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const data = response.data;

            if (data?.bin) {
                const binUrl = `https://filebin.net/${data.bin}`;
                const fileUrl = data.files?.[0]
                    ? `https://filebin.net/${data.bin}/${data.files[0].filename}`
                    : binUrl;

                await ctx.reply(
                    `🌐 *FILEBIN UPLOAD*\n\n` +
                    `❯ Direct URL: ${fileUrl}\n` +
                    `❯ Bin URL: ${binUrl}\n` +
                    `❯ Type: ${mediaType}\n` +
                    `❯ Size: ${ctx.format.formatSize(buffer.length)}\n\n` +
                    `_Hosting via filebin.net_`,
                    { buttons: [{ text: "Open URL", id: fileUrl }] }
                );
            } else {
                await ctx.reply(ctx.format.info("Upload failed. Please try again."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
