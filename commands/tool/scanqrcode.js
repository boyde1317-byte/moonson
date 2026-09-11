const axios = require("axios");
const FormData = require("form-data");

module.exports = {
    name: "scanqrcode",
    aliases: ["scanqr"],
    category: "tool",
    permissions: {
        coin: 10
    },
    code: async (ctx) => {
        if (!ctx.isMedia(["image"])) return await ctx.reply(ctx.format.generateInstruction(["send", "reply"], ["image"]));

        try {
            const buffer = await ctx.msg.download() || await ctx.quoted.download();

            // alwayscodex is dead — qrserver accepts the file directly (multipart)
            const formData = new FormData();
            formData.append("file", buffer, { filename: "qr.png", contentType: "image/png" });

            const response = await axios.post("https://api.qrserver.com/v1/read-qr-code/", formData, {
                headers: formData.getHeaders(),
                timeout: 20000
            });

            const result = response.data?.[0]?.symbol?.[0]?.data;
            if (!result)
                return await ctx.reply(ctx.format.info("Could not read a QR code from that image."));

            await ctx.reply(result);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};