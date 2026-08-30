module.exports = {
    name: "websearch",
    aliases: ["google", "gsearch", "searchweb"],
    category: "search",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "how to make pizza")}\n` +
                ctx.format.generateNotes(["Search the web and get instant answers"])
            );

        try {
            // DuckDuckGo Instant Answer API
            const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(input)}&format=json&no_html=1&skip_disambig=1`;
            const res = (await axios.get(apiUrl, { timeout: 15000 })).data;

            // Primary answer
            if (res.AbstractText) {
                const maxLength = 1200;
                const text = res.AbstractText.length > maxLength
                    ? res.AbstractText.substring(0, maxLength).trim() + "..."
                    : res.AbstractText;

                return await ctx.reply({
                    text:
                        `🔍 *WEB SEARCH*\n\n` +
                        `❯ ${ctx.format.bold("Query")}: ${input}\n` +
                        `❯ ${ctx.format.bold("Source")}: ${res.AbstractSource || "DuckDuckGo"}\n\n` +
                        `${text}\n\n` +
                        `❯ ${ctx.format.bold("Read more")}: ${res.AbstractURL || "N/A"}`,
                    footer: config.msg.footer || "",
                    buttons: [
                        { text: "Open Source", id: res.AbstractURL || "#" },
                        { text: "Search Again", id: `${ctx.used.prefix}${ctx.used.command}` }
                    ]
                });
            }

            // Related topics
            const relatedTopics = (res.RelatedTopics || []).filter(t => t.Text && !t.Topics).slice(0, 5);

            if (relatedTopics.length > 0) {
                let text = `🔍 *WEB SEARCH*\n\n`;
                text += `❯ ${ctx.format.bold("Query")}: ${input}\n`;
                text += `❯ No instant answer found, but here are related topics:\n\n`;

                relatedTopics.forEach((topic, i) => {
                    const topicText = topic.Text.length > 150
                        ? topic.Text.substring(0, 150).trim() + "..."
                        : topic.Text;
                    text += `${i + 1}. ${topicText}\n`;
                    if (topic.FirstURL) text += `   ❯ ${topic.FirstURL}\n`;
                    text += "\n";
                });

                return await ctx.reply(text.trim());
            }

            // Fallback: Wikipedia search
            const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(input)}&format=json&srlimit=3`;
            const wikiRes = (await axios.get(wikiUrl, { timeout: 10000 })).data;

            if (wikiRes.query?.search?.length) {
                let text = `🔍 *WEB SEARCH*\n\n`;
                text += `❯ ${ctx.format.bold("Query")}: ${input}\n`;
                text += `❯ ${ctx.format.bold("Source")}: Wikipedia\n\n`;

                wikiRes.query.search.forEach((article, i) => {
                    const snippet = article.snippet.replace(/<[^>]+>/g, "");
                    text += `${i + 1}. ${ctx.format.bold(article.title)}\n`;
                    text += `   ${snippet}...\n`;
                    text += `   ❯ https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replace(/ /g, "_"))}\n\n`;
                });

                return await ctx.reply(text.trim());
            }

            return await ctx.reply(ctx.format.info(`No results found for "${input}".`));
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
