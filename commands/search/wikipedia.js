module.exports = {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    category: "search",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Albert Einstein")}\n` +
                ctx.format.generateNotes(["Search Wikipedia for any topic"])
            );

        try {
            // Step 1: Search for articles
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(input)}&format=json&srlimit=1`;
            const searchRes = (await axios.get(searchUrl, { timeout: 15000 })).data;

            if (!searchRes.query?.search?.length) {
                return await ctx.reply(ctx.format.info(`No Wikipedia articles found for "${input}".`));
            }

            const article = searchRes.query.search[0];
            const title = article.title;

            // Step 2: Get the full extract
            const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json`;
            const extractRes = (await axios.get(extractUrl, { timeout: 15000 })).data;

            const pages = extractRes.query?.pages || {};
            const page = Object.values(pages)[0];
            const extract = page?.extract || article.snippet?.replace(/<[^>]+>/g, "");

            if (!extract) {
                return await ctx.reply(ctx.format.info(`No content available for "${title}".`));
            }

            // Truncate if too long
            const maxLength = 1500;
            const text = extract.length > maxLength
                ? extract.substring(0, maxLength).trim() + "..."
                : extract;

            return await ctx.reply({
                text:
                    `📚 *WIKIPEDIA*\n\n` +
                    `❯ ${ctx.format.bold("Title")}: ${title}\n` +
                    `❯ ${ctx.format.bold("URL")}: https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}\n\n` +
                    `${text}`,
                footer: config.msg.footer || "",
                buttons: [
                    { text: "Read More", id: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
