module.exports = {
    name: "note",
    aliases: ["notes", "memo", "mynotes"],
    category: "misc",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text;
        const senderDb = ctx.db.user;

        if (!senderDb.notes) senderDb.notes = [];

        // No input: show notes
        if (!input) {
            if (senderDb.notes.length === 0)
                return await ctx.reply(ctx.format.info("You have no saved notes. Use the command to add one!"));

            let text = "📝 *YOUR NOTES*\n\n";
            senderDb.notes.forEach((n, i) => {
                text += `❯ ${i + 1}. ${n}\n`;
            });
            text += `\n_Usage: ${ctx.used.prefix}note add <text> to add_\n_${ctx.used.prefix}note del <number> to delete_`;
            return await ctx.reply(text);
        }

        const cmd = input.split(" ")[0]?.toLowerCase();
        const rest = input.slice(cmd.length).trim();

        // Add note
        if (cmd === "add" && rest) {
            if (senderDb.notes.length >= 20)
                return await ctx.reply(ctx.format.info("You can only store 20 notes. Delete some first!"));

            if (rest.length > 500)
                return await ctx.reply(ctx.format.info("Note too long! Maximum 500 characters."));

            senderDb.notes.push(rest);
            senderDb.save();

            return await ctx.reply(ctx.format.info(`Note saved! You now have ${senderDb.notes.length} notes.`));
        }

        // Delete note
        if (cmd === "del" || cmd === "delete") {
            const index = parseInt(rest) - 1;
            if (isNaN(index) || index < 0 || index >= senderDb.notes.length)
                return await ctx.reply(ctx.format.info("Invalid note number! Check the list first."));

            const deleted = senderDb.notes.splice(index, 1)[0];
            senderDb.save();

            return await ctx.reply(ctx.format.info(`Note deleted: "${deleted.slice(0, 50)}..."`));
        }

        // Clear all
        if (cmd === "clear" || cmd === "wipe") {
            senderDb.notes = [];
            senderDb.save();
            return await ctx.reply(ctx.format.info("All notes cleared!"));
        }

        // Default: treat input as a new note (quick add)
        if (input.length > 500)
            return await ctx.reply(ctx.format.info("Note too long! Maximum 500 characters."));

        if (senderDb.notes.length >= 20)
            return await ctx.reply(ctx.format.info("You can only store 20 notes. Delete some first!"));

        senderDb.notes.push(input);
        senderDb.save();

        await ctx.reply(ctx.format.info(`Note saved! You now have ${senderDb.notes.length} notes.`));
    }
};
