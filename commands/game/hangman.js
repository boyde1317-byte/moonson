
const session = new Map();

module.exports = {
    name: "hangman",
    aliases: ["hmn", "guessword"],
    category: "game",

    code: async (ctx) => {
        if (session.has(ctx.id)) return await ctx.reply(ctx.format.info("A hangman game is already running!"));

        try {
            const WORDS = [
                { word: "javascript", hint: "Programming language" },
                { word: "whatsapp", hint: "Messaging app" },
                { word: "computer", hint: "Electronic device" },
                { word: "internet", hint: "Global network" },
                { word: "keyboard", hint: "Typing tool" },
                { word: "elephant", hint: "Large animal" },
                { word: "mountain", hint: "Geographic feature" },
                { word: "rainbow", hint: "Colorful sky phenomenon" },
                { word: "football", hint: "Popular sport" },
                { word: "guitar", hint: "Musical instrument" },
                { word: "chocolate", hint: "Sweet treat" },
                { word: "astronaut", hint: "Space explorer" },
                { word: "butterfly", hint: "Flying insect" },
                { word: "dinosaur", hint: "Extinct creature" },
                { word: "volcano", hint: "Erupting mountain" },
                { word: "telescope", hint: "Stargazing tool" },
                { word: "penguin", hint: "Flightless bird" },
                { word: "diamond", hint: "Precious stone" },
                { word: "tornado", hint: "Weather phenomenon" },
                { word: "submarine", hint: "Underwater vessel" },
                { word: "octopus", hint: "Sea creature with 8 arms" },
                { word: "pyramid", hint: "Ancient structure" },
                { word: "lightning", hint: "Electric weather" },
                { word: "sandwich", hint: "Food between bread" },
                { word: "calendar", hint: "Date tracker" }
            ];

            const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
            const word = pick.word.toLowerCase();
            const guessed = new Set();
            const maxWrong = 6;
            let wrong = 0;

            const game = {
                word, hint: pick.hint, guessed, wrong, maxWrong,
                timeout: 120000, coin: 12
            };

            session.set(ctx.id, game);

            const render = () => {
                const stages = [
                    "❤️❤️❤️❤️❤️❤️",
                    "💔❤️❤️❤️❤️❤️",
                    "💔💔❤️❤️❤️❤️",
                    "💔💔💔❤️❤️❤️",
                    "💔💔💔💔❤️❤️",
                    "💔💔💔💔💔❤️",
                    "💀💀💀💀💀💀"
                ];
                const display = game.word.split("").map(c => game.guessed.has(c) ? c.toUpperCase() : "_").join(" ");
                return `🪢 *HANGMAN*\n\n${stages[game.wrong]}\n\n${ctx.format.bold(display)}\n\n❯ ${ctx.format.bold("Hint")}: ${game.hint}\n❯ ${ctx.format.bold("Lives")}: ${game.maxWrong - game.wrong}/${game.maxWrong}\n❯ ${ctx.format.bold("Guessed")}: ${game.guessed.size > 0 ? [...game.guessed].join(", ").toUpperCase() : "None yet"}\n❯ ${ctx.format.bold("Reward")}: ${game.coin} Coins`;
            };

            await ctx.reply({
                text:
                    `${render()}\n\n` +
                    `Type a single letter to guess!`,
                buttons: [{ text: "Give Up", id: `surrender_${ctx.used.command}` }]
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

                if (input.length !== 1 || !/[a-z]/.test(input)) return;
                if (game.guessed.has(input)) return await collCtx.reply(ctx.format.info(`You already guessed "${input.toUpperCase()}"!`));

                game.guessed.add(input);

                if (game.word.includes(input)) {
                    const won = game.word.split("").every(c => game.guessed.has(c));
                    if (won) {
                        session.delete(ctx.id);
                        collector.stop();
                        participantDb.coin += game.coin;
                        participantDb.winGame += 1;
                        participantDb.save();
                        return await collCtx.reply({
                            text: `${render()}\n\n${ctx.format.info("🎉 YOU WIN! +" + game.coin + " Coins")}`,
                            buttons: playAgain
                        });
                    }
                    return await collCtx.reply({ text: render() });
                } else {
                    game.wrong++;
                    if (game.wrong >= game.maxWrong) {
                        session.delete(ctx.id);
                        collector.stop();
                        return await collCtx.reply({
                            text: `${render()}\n\n${ctx.format.info("💀 GAME OVER! The word was " + ctx.format.bold(game.word.toUpperCase()))}`,
                            buttons: playAgain
                        });
                    }
                    return await collCtx.reply({ text: render() });
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
