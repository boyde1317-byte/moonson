
module.exports = {
    name: "rps",
    aliases: ["rockpaperscissors", "rock"],
    category: "game",

    code: async (ctx) => {
        const input = (ctx.text || "").toLowerCase().trim();

        const choices = ["rock", "paper", "scissors"];
        const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };

        if (!input || !choices.includes(input)) {
            return await ctx.reply({
                text:
                    `🪨📄✂️ *ROCK PAPER SCISSORS*\n\n` +
                    `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "rock")}\n` +
                    ctx.format.generateNotes([
                        "Choose: rock, paper, or scissors",
                        "Win to earn 5 coins!"
                    ]),
                buttons: [
                    { text: "🪨 Rock", id: `${ctx.used.prefix}rps rock` },
                    { text: "📄 Paper", id: `${ctx.used.prefix}rps paper` },
                    { text: "✂️ Scissors", id: `${ctx.used.prefix}rps scissors` }
                ]
            });
        }

        try {
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const participantDb = ctx.db.user;
            const coin = 5;

            let result, win;
            if (input === botChoice) {
                result = "🤝 It's a TIE!";
                win = null;
            } else if (
                (input === "rock" && botChoice === "scissors") ||
                (input === "paper" && botChoice === "rock") ||
                (input === "scissors" && botChoice === "paper")
            ) {
                result = `🎉 You WIN! +${coin} Coins`;
                win = true;
                participantDb.coin += coin;
                participantDb.winGame += 1;
                participantDb.save();
            } else {
                result = "💀 You LOSE!";
                win = false;
            }

            return await ctx.reply({
                text:
                    `🪨📄✂️ *ROCK PAPER SCISSORS*\n\n` +
                    `You: ${emojis[input]} ${ctx.format.bold(input.toUpperCase())}\n` +
                    `Bot: ${emojis[botChoice]} ${ctx.format.bold(botChoice.toUpperCase())}\n\n` +
                    ctx.format.info(result),
                buttons: [
                    { text: "🪨 Rock", id: `${ctx.used.prefix}rps rock` },
                    { text: "📄 Paper", id: `${ctx.used.prefix}rps paper` },
                    { text: "✂️ Scissors", id: `${ctx.used.prefix}rps scissors` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
