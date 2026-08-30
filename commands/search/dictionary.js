module.exports = {
    name: "define",
    aliases: ["dictionary", "dict"],
    category: "search",
    permissions: {
        coin: 2
    },

    code: async (ctx) => {
        const input = ctx.text?.toLowerCase().trim();

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "serendipity")}\n` +
                ctx.format.generateNotes(["Get definitions, pronunciations, and examples for any English word"])
            );

        try {
            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(input)}`;
            const res = (await axios.get(apiUrl, { timeout: 15000 })).data;

            if (!Array.isArray(res) || res.length === 0) {
                return await ctx.reply(ctx.format.info(`No definition found for "${input}".`));
            }

            const entry = res[0];
            const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || "N/A";
            const meanings = entry.meanings || [];

            let text = `📖 *DICTIONARY*\n\n`;
            text += `❯ ${ctx.format.bold("Word")}: ${entry.word}\n`;
            text += `❯ ${ctx.format.bold("Pronunciation")}: ${phonetic}\n\n`;

            // Show up to 3 meanings
            const maxMeanings = Math.min(meanings.length, 3);
            for (let i = 0; i < maxMeanings; i++) {
                const m = meanings[i];
                text += `${ctx.format.bold(`${i + 1}. ${m.partOfSpeech}`)}\n`;

                const definitions = m.definitions || [];
                const maxDefs = Math.min(definitions.length, 3);
                for (let j = 0; j < maxDefs; j++) {
                    const d = definitions[j];
                    text += `   ❯ ${d.definition}\n`;
                    if (d.example) text += `   ❯ ${ctx.format.bold("Example")}: "${d.example}"\n`;
                    if (d.synonyms?.length) text += `   ❯ ${ctx.format.bold("Synonyms")}: ${d.synonyms.slice(0, 5).join(", ")}\n`;
                }
                text += "\n";
            }

            await ctx.reply(text.trim());
        } catch (error) {
            if (error.response?.status === 404) {
                return await ctx.reply(ctx.format.info(`No definition found for "${input}".`));
            }
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
