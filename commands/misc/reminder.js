module.exports = {
    name: "reminder",
    aliases: ["remind", "remindme", "alarm"],
    category: "misc",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "30m Check the oven")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "2h Call mom")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "1d Submit the report")}\n\n` +
                ctx.format.generateNotes([
                    "Set a personal reminder",
                    "Time format: 30s, 15m, 2h, 1d",
                    "Type 'list' to see active reminders",
                    "Type 'clear' to remove all reminders"
                ])
            );

        const senderDb = ctx.db.user;

        // List reminders
        if (input.toLowerCase() === "list") {
            const reminders = senderDb?.reminders || [];
            if (reminders.length === 0)
                return await ctx.reply(ctx.format.info("You have no active reminders."));

            let text = "⏰ *YOUR REMINDERS*\n\n";
            reminders.forEach((r, i) => {
                const timeLeft = r.triggerTime - Date.now();
                if (timeLeft <= 0) {
                    text += `❯ ${i + 1}. ${r.text} _(${ctx.format.convertMsToDuration(0)} — overdue)_\n`;
                } else {
                    text += `❯ ${i + 1}. ${r.text} _(${ctx.format.convertMsToDuration(timeLeft)} left)_\n`;
                }
            });
            return await ctx.reply(text);
        }

        // Clear reminders
        if (input.toLowerCase() === "clear") {
            senderDb.reminders = [];
            senderDb.save();
            return await ctx.reply(ctx.format.info("All reminders cleared!"));
        }

        // Parse time and text
        const match = input.match(/^(\d+)(s|m|h|d)\s+(.+)/i);
        if (!match)
            return await ctx.reply(ctx.format.info("Invalid format! Use: <time> <message> (e.g. 30m Check the oven)"));

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const text = match[3];

        const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const delay = amount * multipliers[unit];
        const triggerTime = Date.now() + delay;

        // Store reminder
        if (!senderDb.reminders) senderDb.reminders = [];
        senderDb.reminders.push({ text, triggerTime, createdAt: Date.now() });
        senderDb.save();

        await ctx.reply(
            `⏰ *REMINDER SET*\n\n` +
            `❯ Message: ${text}\n` +
            `❯ Time: ${amount}${unit}\n` +
            `❯ Triggers in: ${ctx.format.convertMsToDuration(delay)}\n\n` +
            `_I'll remind you when the time comes!_`
        );

        // Set timeout to send reminder
        setTimeout(async () => {
            try {
                const db = ctx.db.users.get(ctx.sender.jid);
                if (db?.reminders) {
                    db.reminders = db.reminders.filter(r => r.triggerTime !== triggerTime);
                    db.save();
                }
                await ctx.core.sendMessage(ctx.sender.jid, {
                    text: `⏰ *REMINDER*\n\n❯ ${text}\n\n_Set ${amount}${unit} ago_`
                });
            } catch (e) { /* ignore */ }
        }, delay);
    }
};
