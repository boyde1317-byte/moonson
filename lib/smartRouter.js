/**
 * Smart Router — Natural Language Intent Detection
 * 
 * When a message has no command prefix, this module analyzes it for intent
 * and offers interactive buttons to execute the matching command.
 * This is what makes Moonson different from every other WhatsApp bot.
 */

// URL patterns for platform detection
const URL_PATTERNS = {
    youtube:     /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w\-]{6,})/i,
    instagram:   /instagram\.com\/(p|reel|stories)\/([\w\-]+)/i,
    tiktok:      /tiktok\.com\/@[\w.]+\/video\/(\d+)/i,
    twitter:     /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
    facebook:    /facebook\.com\/(?:watch\/?\?v=|share\/[vp]\/|reel\/)/i,
    spotify:     /open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/i,
    soundcloud:  /soundcloud\.com\/[\w-]+\/[\w-]+/i,
    reddit:      /reddit\.com\/r\/\w+\/comments\/([\w]+)/i,
    pinterest:   /pinterest\.com\/pin\/(\d+)/i,
    threads:     /threads\.net\/@?[\w.]+\/post\/([\w]+)/i
};

// Intent keywords that map to commands
const INTENT_MAP = {
    // Download intent
    download: {
        keywords: ["download", "dl", "save", "fetch video", "get video", "grab"],
        action: null, // Dynamic — depends on URL detected
        coin: 10
    },
    // Shorten URL intent
    shorten: {
        keywords: ["shorten", "short url", "tiny url", "make short", "shortlink"],
        command: "shorten",
        coin: 2
    },
    // Search intent
    search: {
        keywords: ["search for", "google", "look up", "find info about", "what is", "who is", "what's a", "tell me about"],
        command: "google",
        coin: 5
    },
    // Weather intent
    weather: {
        keywords: ["weather in", "weather at", "temperature in", "forecast for", "how's the weather"],
        command: "weather",
        coin: 5
    },
    // Translate intent
    translate: {
        keywords: ["translate", "translation", "how do you say"],
        command: "translate",
        coin: 5
    },
    // Sticker intent
    sticker: {
        keywords: ["make sticker", "sticker", "stickerize", "to sticker"],
        command: "sticker",
        coin: 5
    },
    // Remove background intent
    removebg: {
        keywords: ["remove background", "remove bg", "transparent background", "cutout", "no background"],
        command: "removebg",
        coin: 10
    },
    // Horoscope intent
    horoscope: {
        keywords: ["horoscope", "zodiac today", "stars today", "my horoscope", "astrology today"],
        command: "horoscope",
        coin: 3
    },
    // QR code intent
    qrcode: {
        keywords: ["qr code", "generate qr", "make qr", "qr for"],
        command: "qrcode",
        coin: 3
    },
    // Crypto price intent
    crypto: {
        keywords: ["price of", "how much is", "crypto price", "bitcoin price", "btc price", "eth price"],
        command: "crypto",
        coin: 3
    },
    // Fact intent
    fact: {
        keywords: ["random fact", "fun fact", "tell me a fact", "did you know"],
        command: "fact",
        coin: 0
    },
    // Fortune intent
    fortune: {
        keywords: ["fortune", "fortune cookie", "my fortune", "predict my"],
        command: "fortune",
        coin: 0
    },
    // Tarot intent
    tarot: {
        keywords: ["tarot", "draw a card", "card reading", "read my cards"],
        command: "tarot",
        coin: 3
    }
};

// Zodiac signs for horoscope intent detection
const ZODIAC_SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

/**
 * Detect platform from a URL
 */
function detectPlatform(text) {
    for (const [platform, pattern] of Object.entries(URL_PATTERNS)) {
        if (pattern.test(text)) return platform;
    }
    return null;
}

/**
 * Extract the first URL from text
 */
function extractUrl(text) {
    const match = text.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
}

/**
 * Detect intent from a natural language message
 * Returns { intent, command, args, text, platform, url, buttons, caption } or null
 */
function detectIntent(body, quotedType, prefix) {
    // Skip if message starts with a command prefix
    if (prefix && body.startsWith(prefix)) return null;
    
    const lowerBody = body.toLowerCase().trim();
    if (!lowerBody || lowerBody.length < 3) return null;

    const url = extractUrl(body);
    const platform = url ? detectPlatform(body) : null;

    // ── Priority 1: URL detected → offer download ──
    if (url && platform) {
        const platformNames = {
            youtube: "YouTube",
            instagram: "Instagram",
            tiktok: "TikTok",
            twitter: "Twitter/X",
            facebook: "Facebook",
            spotify: "Spotify",
            soundcloud: "SoundCloud",
            reddit: "Reddit",
            pinterest: "Pinterest",
            threads: "Threads"
        };

        const cmdMap = {
            youtube: "yt",
            instagram: "ig",
            tiktok: "tiktok",
            twitter: "twitter",
            facebook: "fb",
            spotify: "spotify",
            soundcloud: "soundcloud",
            reddit: "reddit",
            pinterest: "pinterest",
            threads: "threads"
        };

        const cmd = cmdMap[platform];
        if (!cmd) return null;

        return {
            type: "download",
            platform: platformNames[platform],
            url,
            command: cmd,
            args: url,
            caption: `🔗 *${platformNames[platform]} link detected!*\n\nWant me to download this?`,
            buttons: [
                { text: "⬇️ Download", id: `${prefix}${cmd} ${url}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // ── Priority 2: Reply to image + sticker/removebg keywords ──
    if (quotedType === "image") {
        if (/sticker|stickerize|to sticker/i.test(lowerBody)) {
            return {
                type: "sticker",
                command: "sticker",
                caption: "🖼️ *Image detected + sticker request!*\n\nWant me to turn this into a sticker?",
                buttons: [
                    { text: "🎨 Make Sticker", id: `${prefix}sticker` },
                    { text: "❌ Ignore", id: "ignore" }
                ]
            };
        }
        if (/remove.?bg|remove.?background|transparent|cutout/i.test(lowerBody)) {
            return {
                type: "removebg",
                command: "removebg",
                caption: "🖼️ *Image detected + remove background request!*\n\nWant me to remove the background?",
                buttons: [
                    { text: "✂️ Remove BG", id: `${prefix}removebg` },
                    { text: "❌ Ignore", id: "ignore" }
                ]
            };
        }
        if (/wanted|poster/i.test(lowerBody)) {
            return {
                type: "wanted",
                command: "imgwanted",
                caption: "🤠 *Image detected + wanted request!*\n\nWant me to make a wanted poster?",
                buttons: [
                    { text: "🤠 Make Wanted", id: `${prefix}imgwanted` },
                    { text: "❌ Ignore", id: "ignore" }
                ]
            };
        }
    }

    // ── Priority 3: Intent keyword matching ──
    
    // Horoscope with sign detection
    if (/horoscope|zodiac|astrology|stars today/i.test(lowerBody)) {
        const signMatch = ZODIAC_SIGNS.find(sign => lowerBody.includes(sign));
        if (signMatch) {
            return {
                type: "horoscope",
                command: "horoscope",
                args: signMatch,
                caption: `🔮 *Horoscope request detected!*\n\nWant today's horoscope for ${signMatch.charAt(0).toUpperCase() + signMatch.slice(1)}?`,
                buttons: [
                    { text: "🔮 Get Horoscope", id: `${prefix}horoscope ${signMatch}` },
                    { text: "❌ Ignore", id: "ignore" }
                ]
            };
        }
        return {
            type: "horoscope",
            command: "horoscope",
            caption: "🔮 *Horoscope request detected!*\n\nWhich sign do you want?",
            buttons: ZODIAC_SIGNS.slice(0, 6).map(s => ({
                text: s.charAt(0).toUpperCase() + s.slice(1),
                id: `${prefix}horoscope ${s}`
            })).concat([
                { text: "➡️ More Signs", id: `${prefix}horoscope` },
                { text: "❌ Ignore", id: "ignore" }
            ])
        };
    }

    // Tarot
    if (/tarot|card reading|read my cards|draw a card/i.test(lowerBody)) {
        return {
            type: "tarot",
            command: "tarot",
            caption: "🃏 *Tarot reading request detected!*\n\nWant me to draw a card?",
            buttons: [
                { text: "🃏 Draw Card", id: `${prefix}tarot` },
                { text: "🎴 3-Card Spread", id: `${prefix}tarot3` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // Fortune / Fact
    if (/fortune|fortune cookie/i.test(lowerBody)) {
        return {
            type: "fortune",
            command: "fortune",
            caption: "🥠 *Fortune cookie request detected!*\n\nWant your fortune?",
            buttons: [
                { text: "🥠 Get Fortune", id: `${prefix}fortune` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }
    if (/random fact|fun fact|tell me a fact|did you know/i.test(lowerBody)) {
        return {
            type: "fact",
            command: "fact",
            caption: "💡 *Fun fact request detected!*\n\nWant a random fact?",
            buttons: [
                { text: "💡 Get Fact", id: `${prefix}fact` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // Shorten URL
    if (/shorten|short url|tiny url|shortlink/i.test(lowerBody) && url) {
        return {
            type: "shorten",
            command: "shorten",
            args: url,
            caption: "🔗 *URL shortening request detected!*\n\nWant me to shorten this URL?",
            buttons: [
                { text: "🔗 Shorten", id: `${prefix}shorten ${url}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // Search / What is
    const searchMatch = lowerBody.match(/^(?:what is|who is|what's a|tell me about|search for|google|look up|find info about)\s+(.+)/i);
    if (searchMatch) {
        const query = searchMatch[1].replace(/[?.!]+$/, "").trim();
        if (query.length > 2) {
            return {
                type: "search",
                command: "google",
                args: query,
                caption: `🔍 *Search intent detected!*\n\nSearch for: "${query}"?`,
                buttons: [
                    { text: "🔍 Search Google", id: `${prefix}google ${query}` },
                    { text: "📖 Search Wikipedia", id: `${prefix}wiki ${query}` },
                    { text: "❌ Ignore", id: "ignore" }
                ]
            };
        }
    }

    // Weather
    const weatherMatch = lowerBody.match(/(?:weather in|weather at|temperature in|forecast for|how.?s the weather in)\s+(.+)/i);
    if (weatherMatch) {
        const location = weatherMatch[1].replace(/[?.!]+$/, "").trim();
        return {
            type: "weather",
            command: "weather",
            args: location,
            caption: `🌤️ *Weather request detected!*\n\nCheck weather for: "${location}"?`,
            buttons: [
                { text: "🌤️ Get Weather", id: `${prefix}weather ${location}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // Translate
    const translateMatch = lowerBody.match(/(?:translate|translation|how do you say)\s+(.+)/i);
    if (translateMatch) {
        const text = translateMatch[1].replace(/[?.!]+$/, "").trim();
        return {
            type: "translate",
            command: "translate",
            args: text,
            caption: `🌐 *Translate request detected!*\n\nTranslate: "${text}"?`,
            buttons: [
                { text: "🌐 Translate", id: `${prefix}translate ${text}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // Crypto price
    const cryptoMatch = lowerBody.match(/(?:price of|how much is|crypto price|bitcoin price|btc price|eth price)\s*(.*)/i);
    if (cryptoMatch) {
        const coin = cryptoMatch[1].trim() || "bitcoin";
        return {
            type: "crypto",
            command: "crypto",
            args: coin,
            caption: `💰 *Crypto price request detected!*\n\nCheck price for: "${coin}"?`,
            buttons: [
                { text: "💰 Get Price", id: `${prefix}crypto ${coin}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    // QR code
    const qrMatch = lowerBody.match(/(?:qr code|generate qr|make qr|qr for)\s+(.+)/i);
    if (qrMatch) {
        const text = qrMatch[1].replace(/[?.!]+$/, "").trim();
        return {
            type: "qrcode",
            command: "qrcode",
            args: text,
            caption: `📱 *QR code request detected!*\n\nGenerate QR for: "${text}"?`,
            buttons: [
                { text: "📱 Generate QR", id: `${prefix}qrcode ${text}` },
                { text: "❌ Ignore", id: "ignore" }
            ]
        };
    }

    return null;
}

module.exports = { detectIntent, detectPlatform, extractUrl };
