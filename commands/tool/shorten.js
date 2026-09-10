module.exports = {
    name: "shorten",
    aliases: ["shorturl", "urlshort", "tinyurl"],
    category: "tool",
    permissions: {
        coin: 2
    },

    code: async (ctx) => {
        let url = ctx.args[0] || ctx.helper.extractUrlFromText(ctx.quoted?.body);

        if (!url)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send", "reply"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "https://www.google.com")}\n` +
                ctx.format.generateNotes(["Shorten any URL using is.gd free service"])
            );

        if (!ctx.helper.isUrl(url)) return await ctx.reply(ctx.format.info("Please provide a valid URL!"));

        try {
            // is.gd API — free, no key needed, supports custom aliases
            const shortUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`;

            const response = await axios.get(shortUrl, { timeout: 15000 });
            const short = response.data;

            if (!short || short.includes("error") || short.length > 50) {
                // Fallback: TinyURL
                const tinyUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
                const tinyRes = await axios.get(tinyUrl, { timeout: 15000 });
                const tinyShort = tinyRes.data;

                if (!tinyShort || !ctx.helper.isUrl(tinyShort)) {
                    return await ctx.reply(ctx.format.info("Failed to shorten URL. Please try again."));
                }

                return await ctx.reply({
                    text:
                        `🔗 *URL SHORTENER*\n\n` +
                        `❯ ${ctx.format.bold("Original")}: ${url}\n` +
                        `❯ ${ctx.format.bold("Shortened")}: ${tinyShort}\n\n` +
                        `Tap the button below to copy:`,
                    buttons: [{ text: "Open Short URL", id: tinyShort }]
                });
            }

            return await ctx.reply({
                text:
                    `🔗 *URL SHORTENER*\n\n` +
                    `❯ ${ctx.format.bold("Original")}: ${url}\n` +
                    `❯ ${ctx.format.bold("Shortened")}: ${short}\n\n` +
                    `Tap the button below to open:`,
                buttons: [{ text: "Open Short URL", id: short }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
