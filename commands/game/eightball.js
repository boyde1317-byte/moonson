
module.exports = {
    name: "8ball",
    aliases: ["eightball", "magicball"],
    category: "game",

    code: async (ctx) => {
        const input = ctx.text?.trim();

        if (!input) {
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Will I win the lottery?")}\n` +
                ctx.format.generateNotes(["Ask any yes/no question and let the Magic 8-Ball decide!"])
            );
        }

        try {
            const answers = [
                { text: "It is certain", emoji: "🟢" },
                { text: "Without a doubt", emoji: "🟢" },
                { text: "Yes, definitely", emoji: "🟢" },
                { text: "You may rely on it", emoji: "🟢" },
                { text: "As I see it, yes", emoji: "🟢" },
                { text: "Most likely", emoji: "🟢" },
                { text: "Outlook good", emoji: "🟢" },
                { text: "Yes", emoji: "🟢" },
                { text: "Signs point to yes", emoji: "🟢" },
                { text: "Reply hazy, try again", emoji: "🟡" },
                { text: "Ask again later", emoji: "🟡" },
                { text: "Better not tell you now", emoji: "🟡" },
                { text: "Cannot predict now", emoji: "🟡" },
                { text: "Concentrate and ask again", emoji: "🟡" },
                { text: "Don't count on it", emoji: "🔴" },
                { text: "My reply is no", emoji: "🔴" },
                { text: "My sources say no", emoji: "🔴" },
                { text: "Outlook not so good", emoji: "🔴" },
                { text: "Very doubtful", emoji: "🔴" },
                { text: "No", emoji: "🔴" }
            ];

            const pick = answers[Math.floor(Math.random() * answers.length)];

            return await ctx.reply({
                text:
                    `🎱 *MAGIC 8-BALL*\n\n` +
                    `❓ ${ctx.format.bold(input)}\n\n` +
                    `${pick.emoji} ${ctx.format.bold(pick.text)}`,
                buttons: [{ text: "Ask Again", id: `${ctx.used.prefix}${ctx.used.command}` }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
