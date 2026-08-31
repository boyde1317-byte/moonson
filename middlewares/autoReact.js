/**
 * Auto-React Middleware — Smart emoji reactions based on message content.
 * Makes the bot feel alive by reacting to messages with contextually appropriate emojis.
 * Only reacts to ~15% of messages to avoid being annoying.
 */

const REACTION_MAP = [
    // Greetings
    { patterns: [/^hi\b/i, /^hello\b/i, /^hey\b/i, /^hola\b/i, /^good morning/i, /^good evening/i], emoji: "👋" },
    // Laughter / funny
    { patterns: [/lol/i, /lmao/i, /rofl/i, /haha/i, /😂|🤣|😆/i, /that.?s funny/i], emoji: "😂" },
    // Love / appreciation
    { patterns: [/i love/i, /love you/i, /thank/i, /thanks/i, /appreciate/i, /❤️|💕|💜/i], emoji: "❤️" },
    // Sad
    { patterns: [/sad/i, /depress/i, /cry|crying/i, /😭/i, /hurt/i, /pain/i], emoji: "😢" },
    // Angry
    { patterns: [/angry/i, /mad/i, /furious/i, /😡|🤬/i, /stupid/i], emoji: "😡" },
    // Confused
    { patterns: [/confused/i, /what\?/i, /idk/i, /wtf/i, /huh/i, /🤔/i], emoji: "🤔" },
    // Agreement / cool
    { patterns: [/^yes\b/i, /^yeah\b/i, /^yep\b/i, /exactly/i, /that.?s right/i, /cool/i, /nice/i, /awesome/i], emoji: "👍" },
    // Celebration
    { patterns: [/congrats/i, /congratulation/i, /yay/i, /woohoo/i, /🎉/i, /celebrate/i], emoji: "🎉" },
    // Fire / impressive
    { patterns: [/fire/i, /lit\b/i, /amazing/i, /incredible/i, /🔥/i, /goated/i, /goat/i], emoji: "🔥" },
    // Questions
    { patterns: [/^(what|how|why|when|where|who)\b/i, /\?$/], emoji: "🤔" },
    // Money
    { patterns: [/money/i, /rich/i, /cash/i, /dollar/i, /paid/i, /💸|💰/i], emoji: "💰" },
    // Sleep / tired
    { patterns: [/tired/i, /sleep/i, /sleepy/i, /😴/i, /exhausted/i], emoji: "😴" },
    // Food
    { patterns: [/food/i, /hungry/i, /eat/i, /pizza|burger|ramen/i, /🍕|🍔/i], emoji: "😋" },
    // Music
    { patterns: [/music/i, /song/i, /listening to/i, /spotify/i, /🎵|🎶/i], emoji: "🎵" },
    // Heart eyes
    { patterns: [/beautiful/i, /gorgeous/i, /cute/i, /adorable/i, /😍|🥰/i], emoji: "😍" },
    // Thumbs down
    { patterns: [/nope\b/i, /terrible/i, /awful/i, /worst/i, /hate/i, /👎/i], emoji: "👎" },
    // 100
    { patterns: [/100/i, /percent/i, /facts/i, /💯/i, /real/i], emoji: "💯" },
    // Party
    { patterns: [/party/i, /weekend/i, /friday/i, /celebration/i, /🥳/i], emoji: "🥳" },
    // Clap
    { patterns: [/well done/i, /good job/i, /nice work/i, /👏/i, /bravo/i], emoji: "👏" },
    // Thinking
    { patterns: [/hmm/i, /let me think/i, /maybe/i, /perhaps/i], emoji: "🤔" },
    // Shocked
    { patterns: [/wow/i, /omg/i, /no way/i, /seriously/i, /😱|😮/i, /shocking/i], emoji: "😮" },
    // Pray
    { patterns: [/amen/i, /prayer/i, /bless/i, /pray/i, /🙏/i], emoji: "🙏" },
    // Flex
    { patterns: [/gym/i, /workout/i, /exercise/i, /muscle/i, /💪/i], emoji: "💪" },
    // Brain / smart
    { patterns: [/smart/i, /genius/i, /brilliant/i, /🧠/i, /intelligent/i], emoji: "🧠" },
    // Coffee
    { patterns: [/coffee/i, /espresso/i, /latte/i, /☕/i], emoji: "☕" },
    // Dog
    { patterns: [/dog/i, /puppy/i, /🐶|🐕/i], emoji: "🐕" },
    // Cat
    { patterns: [/cat/i, /kitten/i, /🐱|🐈/i], emoji: "🐱" }
];

module.exports = function AutoReact(bot) {
    // Check if auto-react is enabled in config
    const enabled = config?.system?.autoReact !== false; // Default: enabled
    
    if (!enabled) return;

    bot.use(async (ctx, next) => {
        // Only react in groups, not private chats
        if (!ctx.isGroup()) {
            await next();
            return;
        }

        // Don't react to command messages
        const body = ctx._msg?.body || "";
        if (body.startsWith(".") || body.startsWith("!") || body.startsWith("/") || body.startsWith("#")) {
            await next();
            return;
        }

        // Don't react to bot's own messages
        if (ctx._msg?.key?.fromMe) {
            await next();
            return;
        }

        // Random probability — only react ~15% of the time to avoid being annoying
        if (Math.random() > 0.15) {
            await next();
            return;
        }

        // Find matching reaction
        for (const reaction of REACTION_MAP) {
            for (const pattern of reaction.patterns) {
                if (pattern.test(body)) {
                    try {
                        await ctx.replyReact(reaction.emoji);
                    } catch (e) {
                        // Silently fail — reactions are non-critical
                    }
                    break;
                }
            }
        }

        await next();
    });
};
