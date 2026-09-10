
const session = new Map();

module.exports = {
    name: "tictactoe",
    aliases: ["ttt", "xo"],
    category: "game",

    code: async (ctx) => {
        if (session.has(ctx.id)) return await ctx.reply(ctx.format.info("A game is already running in this chat!"));

        try {
            const mention = ctx.msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!mention) {
                return await ctx.reply(
                    `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "@player2")}\n` +
                    ctx.format.generateNotes([
                        "Mention a player to challenge them to Tic-Tac-Toe!",
                        "The challenger plays as X and the opponent plays as O"
                    ])
                );
            }

            if (mention === ctx.sender.jid) return await ctx.reply(ctx.format.info("You can't play against yourself!"));

            const symbols = { p1: "❌", p2: "⭕" };
            const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
            const game = {
                board,
                players: { p1: ctx.sender.jid, p2: mention },
                names: { p1: ctx.sender.pushName || "Player 1", p2: "Player 2" },
                turn: "p1",
                moves: 0,
                timeout: 60000,
                coin: 10
            };

            session.set(ctx.id, game);

            const renderBoard = (b) => {
                const symbols = { "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣", "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣" };
                return b.map(c => symbols[c] || c).reduce((acc, val, i) => acc + val + ((i + 1) % 3 === 0 ? (i < 8 ? "\n" : "") : " "), "");
            };

            const checkWin = (b, sym) => {
                const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                return lines.some(([a,c,d]) => b[a] === sym && b[c] === sym && b[d] === sym);
            };

            const getButtons = () => {
                const labels = { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9" };
                return game.board.map((cell, i) => ({
                    text: labels[cell] || cell,
                    id: `ttt_move_${i}`
                }));
            };

            const playAgain = [{ text: "Play Again", id: `${ctx.used.prefix}${ctx.used.command}` }];

            await ctx.reply({
                text:
                    `🎮 *TIC-TAC-TOE*\n\n` +
                    `❌ ${game.names.p1} vs ⭕ ${game.names.p2}\n\n` +
                    `${renderBoard(game.board)}\n\n` +
                    `❯ ${ctx.format.bold("Turn")}: ${symbols[game.turn]} ${game.turn === "p1" ? game.names.p1 : game.names.p2}\n` +
                    `❯ ${ctx.format.bold("Reward")}: ${game.coin} Coins`,
                buttons: getButtons()
            });

            const collector = ctx.MessageCollector({ time: game.timeout });

            collector.on("collect", async (collCtx) => {
                const input = collCtx.msg.body?.toLowerCase().trim();
                const sender = collCtx.sender.jid;
                const participantDb = collCtx.db.user;

                const moveMatch = input.match(/^ttt_move_(\d)$/);
                if (!moveMatch) return;

                const pos = parseInt(moveMatch[1]);
                const currentPlayer = game.turn;
                const playerJid = game.players[currentPlayer];

                if (sender !== playerJid) {
                    return await collCtx.reply(ctx.format.info(`It's ${symbols[currentPlayer]}'s turn (${game.names[currentPlayer]})!`));
                }

                if (!isNaN(parseInt(game.board[pos]))) {
                    game.board[pos] = symbols[currentPlayer];
                    game.moves++;

                    if (checkWin(game.board, symbols[currentPlayer])) {
                        session.delete(ctx.id);
                        collector.stop();
                        participantDb.winGame += 1;
                        participantDb.coin += game.coin;
                        participantDb.save();
                        return await collCtx.reply({
                            text:
                                `${ctx.format.info("🎉 " + symbols[currentPlayer] + " " + game.names[currentPlayer] + " WINS! +" + game.coin + " Coins")}\n\n` +
                                `${renderBoard(game.board)}`,
                            buttons: playAgain
                        });
                    }

                    if (game.moves === 9) {
                        session.delete(ctx.id);
                        collector.stop();
                        return await collCtx.reply({
                            text: `${ctx.format.info("🤝 It's a DRAW!")}\n\n${renderBoard(game.board)}`,
                            buttons: playAgain
                        });
                    }

                    game.turn = currentPlayer === "p1" ? "p2" : "p1";

                    return await collCtx.reply({
                        text:
                            `🎮 *TIC-TAC-TOE*\n\n` +
                            `❌ ${game.names.p1} vs ⭕ ${game.names.p2}\n\n` +
                            `${renderBoard(game.board)}\n\n` +
                            `❯ ${ctx.format.bold("Turn")}: ${symbols[game.turn]} ${game.turn === "p1" ? game.names.p1 : game.names.p2}`,
                        buttons: getButtons()
                    });
                }
            });

            collector.on("end", async () => {
                if (session.has(ctx.id)) {
                    session.delete(ctx.id);
                    await ctx.reply({
                        text: ctx.format.info("Game timed out! No moves made in time."),
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
