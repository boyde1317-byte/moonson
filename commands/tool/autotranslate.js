const axios = require("axios");

/**
 * Auto-Translate — Detects foreign language messages and offers translation.
 * Uses the Smart Router to detect when a message looks non-English.
 * Can also be used as a command: .tr <text> or .translate <text>
 */

// Common non-English character ranges
const FOREIGN_PATTERNS = {
    arabic:     /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
    chinese:    /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/,
    japanese:   /[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]/,
    korean:     /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
    russian:    /[\u0400-\u04FF\u0500-\u052F]/,
    thai:       /[\u0E00-\u0E7F]/,
    hebrew:     /[\u0590-\u05FF\uFB1D-\uFB4F]/,
    hindi:      /[\u0900-\u097F\uA8E0-\uA8FF]/,
    greek:      /[\u0370-\u03FF\u1F00-\u1FFF]/
};

function detectLanguage(text) {
    for (const [lang, pattern] of Object.entries(FOREIGN_PATTERNS)) {
        if (pattern.test(text)) return lang;
    }
    
    // Check for common non-English Latin-script words
    const lower = text.toLowerCase();
    const nonEnglish = [
        [/ñ|¿|¡|para|como|está|hola|gracias|buenos|por favor/i, "spanish"],
        [/bonjour|merci|comment|salut|oui|non|avec|pour|dans|c'est/i, "french"],
        [/hallo|danke|wie|gut|mehr|nicht|auch|noch|schon|über/i, "german"],
        [/ciao|grazie|perché|come|stai|buongiorno|prego|allora/i, "italian"],
        [/olá|obrigado|como|está|bom|dia|não|você|para/i, "portuguese"],
        [/merhaba|teşekkür|nasıl|iyi|değil|için|var|ben/im, "turkish"],
        [/안녕|감사|어떻게|좋은|하지/i, "korean"],
        [/こんにちは|ありがとう|はじめまして|すみません/i, "japanese"],
        [/你好|谢谢|请|对不起|你好吗/i, "chinese"],
        [/здравствуйте|спасибо|как|хорошо|не|для/i, "russian"],
        [/مرحبا|شكرا|كيف|حلال/i, "arabic"]
    ];
    
    for (const [pattern, lang] of nonEnglish) {
        if (pattern.test(lower)) return lang;
    }
    
    return null;
}

module.exports = {
    name: "tr",
    aliases: ["translate", "autotranslate", "detect"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input) {
            return await ctx.reply(
                "🌐 *AUTO-TRANSLATE*\n\n" +
                "Translate any text or reply to a message to translate it.\n\n" +
                "*Examples:*\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "tr Bonjour le monde") + "\n" +
                "❯ Reply to a message + " + ctx.format.inlineCode(ctx.used.prefix + "tr") + "\n\n" +
                "*Auto-detects the language and translates to English.*"
            );
        }

        try {
            const detectedLang = detectLanguage(input);
            const langDisplay = detectedLang 
                ? detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1)
                : "Auto-detected";

            // Use Google Translate via popcat API
            const apiUrl = "https://api.popcat.xyz/translate?text=" + 
                encodeURIComponent(input.slice(0, 500)) + 
                "&to=en";

            const { data } = await axios.get(apiUrl, { timeout: 15000 });

            if (!data?.translated)
                return await ctx.reply(ctx.format.info("Could not translate this text."));

            const caption =
                "🌐 *TRANSLATION*\n\n" +
                `❯ *Detected*: ${langDisplay}\n` +
                `❯ *Original*: ${input.slice(0, 200)}\n` +
                `❯ *English*: ${data.translated}\n\n` +
                `🔄 ${ctx.format.bold("Auto-Translate")}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
