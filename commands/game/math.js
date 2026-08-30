
const session = new Map();

module.exports = {
    name: "math",
    aliases: ["mathquiz", "mathgame"],
    category: "game",

    code: async (ctx) => {
        if (session.has(ctx.id)) return await ctx.reply(ctx.format.info("A math game is already running!"));

        try {
            const difficulty = (ctx.text || "").toLowerCase().trim();
            const levels = {
                easy:   { max: 20,   ops: ["+", "-"],            coin: 5,  time: 30000 },
                medium: { max: 100,  ops: ["+", "-", "*"],       coin: 10, time: 25000 },
                hard:   { max: 500,  ops: ["+", "-", "*", "/"],  coin: 20, time: 20000 }
            };

            const level = levels[difficulty] || levels.easy;
            const op = level.ops[Math.floor(Math.random() * level.ops.length)];

            let a, b, answer;
            switch (op) {
                case "+": a = Math.floor(Math.random() * level.max) + 1; b = Math.floor(Math.random() * level.max) + 1; answer = a + b; break;
                case "-": a = Math.floor(Math.random() * level.max) + 1; b = Math.floor(Math.random() * a) + 1; answer = a - b; break;
                case "*": a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; break;
                case "/": b = Math.floor(Math.random() * 11) + 2; answer = Math.floor(Math.random() * 12) + 1; a = b * answer; break;
            }

            const game = { question: `${a} ${op} ${b}`, answer: String(answer), coin: level.coin, timeout: level.time, level: difficulty || "easy" };

            session.set(ctx.id, game);

            await ctx.reply({
                text:
                    `🧮 *MATH QUIZ* (${(difficulty || "easy").toUpperCase()})\n\n` +
                    `❓ What is ${ctx.format.bold(game.question)} = ?\n\n` +
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
                        text: ctx.format.info(`You gave up! The answer was ${ctx.format.bold(game.answer)}`),
                        buttons: playAgain
                    });
                }

                if (input === game.answer) {
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

                if (Math.abs(parseInt(input) - parseInt(game.answer)) <= 1 && input.length > 0) {
                    return await collCtx.reply(ctx.format.info("So close! Try again."));
                }
            });

            collector.on("end", async () => {
                if (session.has(ctx.id)) {
                    session.delete(ctx.id);
                    await ctx.reply({
                        text: ctx.format.info(`Time's up! The answer was ${ctx.format.bold(game.answer)}`),
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
