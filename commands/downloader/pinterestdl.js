const axios = require("axios");

module.exports = {
    name: "pinterestdl",
    aliases: ["pindl"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        let url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://id.pinterest.com/pin/843580573994363210")}\n` +
                ctx.format.generateNotes([
                    "Download images or videos from Pinterest",
                    "Supports pinterest.com and pin.it links"
                ])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        try {
            // Resolve pin.it short URLs to full Pinterest URLs
            if (url.includes("pin.it")) {
                try {
                    const resolveRes = await axios.get(url, {
                        maxRedirects: 5,
                        timeout: 10000,
                        validateStatus: () => true
                    });
                    // The final URL after redirects will be the full pinterest.com URL
                    const finalUrl = resolveRes.request?.res?.responseUrl || url;
                    if (finalUrl.includes("pinterest.com")) {
                        url = finalUrl;
                    }
                } catch (e) {
                    // Continue with original URL
                }
            }

            let result = null;
            let lastError = null;

            // Primary API: nexray
            try {
                const apiUrl = ctx.api.createUrl("nexray", "/downloader/pinterest", {
                    url
                });
                const response = await ctx.request.get(apiUrl);

                if (response?.data?.status !== false && response?.data?.result) {
                    result = response.data.result;
                } else {
                    lastError = response?.data?.error || "No data returned";
                }
            } catch (e) {
                lastError = e.message;
            }

            // Fallback: try siputzx API
            if (!result) {
                try {
                    const fallbackUrl = ctx.api.createUrl("siputzx", "/api/dl/pinterest", {
                        url
                    });
                    const fallbackRes = await ctx.request.get(fallbackUrl);

                    if (fallbackRes?.data?.status && fallbackRes?.data?.data) {
                        const data = fallbackRes.data.data;
                        result = {
                            image: data.images?.[0] || data.image,
                            video: data.videos?.[0] || data.video
                        };
                    }
                } catch (e) {
                    // Continue
                }
            }

            if (!result || (!result.image && !result.video))
                return await ctx.reply(ctx.format.info(`Could not download from this Pinterest link. ${lastError ? `Error: ${lastError}` : "The link may be invalid or private."}`));

            const mediaUrl = result.image || result.video;
            const isVideo = !!result.video && !result.image;

            await ctx.reply({
                [isVideo ? "video" : "image"]: {
                    url: mediaUrl
                },
                caption: `› ${ctx.format.bold("URL")}: ${url}\n› ${ctx.format.bold("Type")}: ${isVideo ? "Video" : "Image"}`
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
