module.exports = {
    name: "threadsdl",
    aliases: ["threads", "threaddl", "thrdl"],
    category: "downloader",
    permissions: {
        coin: 10
    },

    code: async (ctx) => {
        const url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.threads.net/@user/post/123456")}\n` +
                ctx.format.generateNotes(["Download media from Threads posts"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info(config.msg.invalidUrl));

        if (!/threads\.net/i.test(url))
            return await ctx.reply(ctx.format.info("Please provide a valid Threads URL!"));

        try {
            // Try nexray Threads downloader
            const apiUrl = ctx.api.createUrl("nexray", "/downloader/threads", { url });
            let result;
            try {
                result = (await ctx.request.get(apiUrl)).data.result;
            } catch (e) {
                // Fallback: alwayscodex
                const fallbackUrl = ctx.api.createUrl("alwayscodex", "/api/downloader/threads", { url });
                result = (await ctx.request.get(fallbackUrl)).data.result;
            }

            // Threads can have multiple media items
            const mediaList = Array.isArray(result) ? result : [result];
            const caption = result?.caption || result?.text || "Threads Post";
            const username = result?.username || result?.author || "Unknown";

            let sent = 0;
            for (const media of mediaList) {
                const mediaUrl = media?.url || media?.download || media?.video || media?.image;

                if (!mediaUrl) continue;

                const isVideo = mediaUrl.includes("video") || mediaUrl.endsWith(".mp4") || media.type === "video";

                if (sent === 0) {
                    // First media: include caption
                    if (isVideo) {
                        await ctx.reply({
                            video: { url: mediaUrl },
                            caption:
                                `🧵 *THREADS DOWNLOAD*\n\n` +
                                `❯ ${ctx.format.bold("Author")}: @${username}\n` +
                                `❯ ${ctx.format.bold("Caption")}: ${caption}`
                        });
                    } else {
                        await ctx.reply({
                            image: { url: mediaUrl },
                            caption:
                                `🧵 *THREADS DOWNLOAD*\n\n` +
                                `❯ ${ctx.format.bold("Author")}: @${username}\n` +
                                `❯ ${ctx.format.bold("Caption")}: ${caption}`
                        });
                    }
                } else {
                    // Subsequent media: no caption
                    if (isVideo) {
                        await ctx.reply({ video: { url: mediaUrl } });
                    } else {
                        await ctx.reply({ image: { url: mediaUrl } });
                    }
                }
                sent++;
            }

            if (sent === 0) {
                return await ctx.reply(ctx.format.info("No downloadable media found in this Threads post."));
            }
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
