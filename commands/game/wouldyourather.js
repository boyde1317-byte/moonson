
module.exports = {
    name: "wouldyourather",
    aliases: ["wyr", "would"],
    category: "game",

    code: async (ctx) => {
        try {
            const QUESTIONS = [
                { a: "Have the ability to fly", b: "Be invisible at will" },
                { a: "Have unlimited money", b: "Have unlimited time" },
                { a: "Live without music", b: "Live without movies" },
                { a: "Always be 10 minutes late", b: "Always be 20 minutes early" },
                { a: "Have super strength", b: "Have super speed" },
                { a: "Speak every language", b: "Play every instrument" },
                { a: "Never sleep again", b: "Never eat again" },
                { a: "Have a rewind button for life", b: "Have a pause button for life" },
                { a: "Be the funniest person alive", b: "Be the smartest person alive" },
                { a: "Live in the mountains", b: "Live on the beach" },
                { a: "Have free WiFi everywhere", b: "Have free coffee everywhere" },
                { a: "Time travel to the past", b: "Time travel to the future" },
                { a: "Win the lottery once", b: "Live twice as long" },
                { a: "Be a famous celebrity", b: "Be an unknown billionaire" },
                { a: "Always know the truth", b: "Never be lied to" },
                { a: "Have a personal chef", b: "Have a personal driver" },
                { a: "Read minds", b: "See the future" },
                { a: "Be too hot all the time", b: "Be too cold all the time" },
                { a: "Have an endless summer", b: "Have an endless winter" },
                { a: "Be the best at one thing", b: "Be good at everything" },
                { a: "Never use social media again", b: "Never watch TV again" },
                { a: "Travel the world for free", b: "Have your dream house for free" },
                { a: "Be able to talk to animals", b: "Be able to talk to ghosts" },
                { a: "Have a photographic memory", b: "Never forget a face" },
                { a: "Be rich and lonely", b: "Be poor and loved" },
                { a: "Always have to shout", b: "Always have to whisper" },
                { a: "Fight 100 duck-sized horses", b: "Fight 1 horse-sized duck" },
                { a: "Have unlimited phone battery", b: "Have unlimited internet data" },
                { a: "Only be able to whisper", b: "Only be able to shout" },
                { a: "Give up your phone for a year", b: "Give up your friends for a year" }
            ];

            const pick = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

            return await ctx.reply({
                text:
                    `🤔 *WOULD YOU RATHER*\n\n` +
                    `Option A: ${ctx.format.bold(pick.a)}\n` +
                    `Option B: ${ctx.format.bold(pick.b)}\n\n` +
                    `Pick your choice below!`,
                buttons: [
                    { text: "🔵 Option A", id: `wyr_a_${ctx.used.command}` },
                    { text: "🔴 Option B", id: `wyr_b_${ctx.used.command}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
