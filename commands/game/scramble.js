
const session = new Map();

module.exports = {
    name: "scramble",
    aliases: ["wordguess", "wordscramble"],
    category: "game",

    code: async (ctx) => {
        if (session.has(ctx.id)) return await ctx.reply(ctx.format.info("A word scramble game is already running!"));

        try {
            const WORDS = [
                { word: "javascript", hint: "Programming language" },
                { word: "adventure", hint: "Exciting experience" },
                { word: "wonderful", hint: "Amazing feeling" },
                { word: "knowledge", hint: "Power of information" },
                { word: "beautiful", hint: "Pleasing to the eye" },
                { word: "mystery", hint: "Something unknown" },
                { word: "happiness", hint: "State of joy" },
                { word: "champion", hint: "Winner of a contest" },
                { word: "galaxy", hint: "Star system" },
                { word: "keyboard", hint: "Typing device" },
                { word: "computer", hint: "Electronic machine" },
                { word: "creative", hint: "Full of imagination" },
                { word: "elephant", hint: "Large land animal" },
                { word: "mountain", hint: "Tall geographic feature" },
                { word: "rainbow", hint: "Colorful sky arc" },
                { word: "firework", hint: "Explosive celebration" },
                { word: "sapphire", hint: "Blue gemstone" },
                { word: "whisper", hint: "Quiet speech" },
                { word: "thunder", hint: "Loud sky sound" },
                { word: "treasure", hint: "Valuable discovery" },
                { word: "umbrella", hint: "Rain protector" },
                { word: "volcano", hint: "Erupting mountain" },
                { word: "penguin", hint: "Flightless bird" },
                { word: "diamond", hint: "Precious stone" },
                { word: "wizard", hint: "Magic user" },
                { word: "rocket", hint: "Space vehicle" },
                { word: "castle", hint: "Royal building" },
                { word: "forest", hint: "Many trees" },
                { word: "ocean", hint: "Vast body of water" },
                { word: "dragon", hint: "Mythical creature" }
            ];

            const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
            const word = pick.word.toLowerCase();

            // Shuffle the word
            const shuffled = word.split("").sort(() => Math.random() - 0.5).join("");
            // Make sure it's actually scrambled
            const finalScrambled = shuffled === word ? word.split("").reverse().join("") : shuffled;

            const game = {
                word, scrambled: finalScrambled, hint: pick.hint,
                timeout: 45000, coin: 10
            };

            session.set(ctx.id, game);

            await ctx.reply({
                text:
                    `🔤 *WORD SCRAMBLE*\n\n` +
                    `Unscramble: ${ctx.format.bold(finalScrambled.toUpperCase())}\n\n` +
                    `❯ ${ctx.format.bold("Hint")}: ${game.hint}\n` +
                    `❯ ${ctx.format.bold("Reward")}: ${game.coin} Coins\n` +
                    `❯ ${ctx.format.bold("Time limit")}: ${ctx.format.convertMsToDuration(game.timeout)}`,
                buttons: [
                    { text: "Give Up", id: `surrender_${ctx.used.command}` }
                ]
            });

            const collector = ctx.MessageCollector({ time: game.timeout });
            const playAgain = [{ text: "Play Again", id: `${ctx.used.prefix}${ctx.used.command}` }];

            collector.on("collect", async (collCtx) => {
                const input = collCtx.msg.body?.toLowerCase().trim();
                const participantDb = collCtx.db.user;

                if (input === `surrender_${ctx.used.command}`) {
                    session.delete(ctx.id);
                    collector.stop();
                    return await collCtx.reply({
                        text: ctx.format.info(`You gave up! The word was ${ctx.format.bold(game.word.toUpperCase())}`),
                        buttons: playAgain
                    });
                }

                if (input === game.word) {
                    session.delete(ctx.id);
                    collector.stop();
                    participantDb.coin += game.coin;
                    participantDb.winGame += 1;
                    participantDb.save();
                    return await collCtx.reply({
                        text: ctx.format.info(`✅ CORRECT! +${game.coin} Coins`),
                        buttons: playAgain
                    });
                }

                if (tools.cmd.didYouMean(input, [game.word]) === game.word) {
                    return await collCtx.reply(ctx.format.info("So close! Try again."));
                }
            });

            collector.on("end", async () => {
                if (session.has(ctx.id)) {
                    session.delete(ctx.id);
                    await ctx.reply({
                        text: ctx.format.info(`Time's up! The word was ${ctx.format.bold(game.word.toUpperCase())}`),
                        buttons: playAgain
                    });
                }
            });

        } catch (error) {
            session.delete(ctx.id);
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
