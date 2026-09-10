module.exports = {
    name: "quote",
    aliases: ["randomquote", "inspire", "motivation"],
    category: "misc",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
            { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
            { text: "The man who moves a mountain begins by carrying away small stones.", author: "Chinese Proverb" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { text: "Your limitation—it's only your imagination.", author: "Unknown" },
            { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
            { text: "Great things never come from comfort zones.", author: "Unknown" },
            { text: "Dream it. Wish it. Do it.", author: "Unknown" },
            { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
            { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
            { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
            { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
            { text: "Little things make big days.", author: "Unknown" },
            { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
            { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
            { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
            { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
            { text: "Dream big. Work hard. Stay focused. Surround yourself with good people.", author: "Unknown" }
        ];

        try {
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            await ctx.reply(
                `💬 *QUOTE OF THE MOMENT*\n\n` +
                `_"${quote.text}"_\n\n` +
                `— ${ctx.format.bold(quote.author)}`
            );
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
