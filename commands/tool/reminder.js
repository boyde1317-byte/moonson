/**
 * Reminder System — Schedule reminders in natural language.
 * "remind me in 2 hours to check the oven"
 * "remind me tomorrow at 9am to call mom"
 * "remind me in 30 minutes to take medicine"
 */

const { config } = global;

// Parse natural language time strings into milliseconds
function parseTimeInput(text) {
    if (!text) return null;

    const now = new Date();
    const lower = text.toLowerCase();

    // "in X hours/minutes/seconds/days"
    const inMatch = lower.match(/in\s+(\d+)\s*(second|minute|hour|day|week)s?/i);
    if (inMatch) {
        const num = parseInt(inMatch[1]);
        const unit = inMatch[2].toLowerCase();
        const multipliers = { second: 1000, minute: 60000, hour: 3600000, day: 86400000, week: 604800000 };
        return { delay: num * multipliers[unit], display: `${num} ${unit}${num > 1 ? "s" : ""}` };
    }

    // "tomorrow at HH:MM" or "tomorrow at H AM/PM"
    const tomorrowMatch = lower.match(/tomorrow\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (tomorrowMatch) {
        let hour = parseInt(tomorrowMatch[1]);
        const minute = tomorrowMatch[2] ? parseInt(tomorrowMatch[2]) : 0;
        const ampm = tomorrowMatch[3]?.toLowerCase();
        
        if (ampm === "pm" && hour < 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;
        
        const target = new Date(now);
        target.setDate(target.getDate() + 1);
        target.setHours(hour, minute, 0, 0);
        
        const delay = target.getTime() - now.getTime();
        if (delay <= 0) return null;
        
        return { delay, display: `tomorrow at ${hour}:${String(minute).padStart(2, "0")}` };
    }

    // "today at HH:MM"
    const todayMatch = lower.match(/(?:today\s+)?at\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (todayMatch) {
        let hour = parseInt(todayMatch[1]);
        const minute = parseInt(todayMatch[2]);
        const ampm = todayMatch[3]?.toLowerCase();
        
        if (ampm === "pm" && hour < 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;
        
        const target = new Date(now);
        target.setHours(hour, minute, 0, 0);
        
        let delay = target.getTime() - now.getTime();
        if (delay <= 0) delay += 86400000; // Next day if time already passed
        
        return { delay, display: `at ${hour}:${String(minute).padStart(2, "0")}` };
    }

    // "in X hours and Y minutes"
    const combinedMatch = lower.match(/in\s+(\d+)\s*hours?\s+(?:and\s+)?(\d+)\s*minutes?/i);
    if (combinedMatch) {
        const hours = parseInt(combinedMatch[1]);
        const minutes = parseInt(combinedMatch[2]);
        const delay = (hours * 3600000) + (minutes * 60000);
        return { delay, display: `${hours}h ${minutes}m` };
    }

    return null;
}

function extractReminderText(text) {
    if (!text) return "";
    // Remove the time part and keep the task
    let task = text
        .replace(/^remind\s+(me\s+|us\s+)?/i, "")
        .replace(/in\s+\d+\s*(second|minute|hour|day|week)s?/i, "")
        .replace(/tomorrow\s+at\s+\d{1,2}(?::\d{2})?\s*(am|pm)?/i, "")
        .replace(/today\s+at\s+\d{1,2}:\d{2}\s*(am|pm)?/i, "")
        .replace(/at\s+\d{1,2}:\d{2}\s*(am|pm)?/i, "")
        .replace(/^(to|that|about)\s+/i, "")
        .trim();
    
    return task || "your reminder";
}

module.exports = {
    name: "remind",
    aliases: ["reminder", "remindme", "setreminder"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input) {
            return await ctx.reply(
                "⏰ *REMINDER SYSTEM*\n\n" +
                "Set a reminder in natural language!\n\n" +
                "*Examples:*\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind in 2 hours to check the oven") + "\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind in 30 minutes to take medicine") + "\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind tomorrow at 9am to call mom") + "\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind in 1 hour and 30 minutes to leave") + "\n\n" +
                "*Manage reminders:*\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind list") + " — View active reminders\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "remind cancel <id>") + " — Cancel a reminder"
            );
        }

        // List reminders
        if (input.toLowerCase() === "list") {
            const userDb = ctx.db.user;
            const reminders = userDb.reminders || [];
            if (!reminders.length)
                return await ctx.reply(ctx.format.info("You have no active reminders."));

            let caption = "⏰ *YOUR REMINDERS*\n\n";
            reminders.forEach((r, i) => {
                const remaining = Math.max(0, Math.round((r.fireAt - Date.now()) / 60000));
                caption += `${i + 1}. *${r.task}*\n⏱️ In ${remaining} min\n🆔 ${r.id}\n\n`;
            });
            return await ctx.reply(caption);
        }

        // Cancel reminder
        if (input.toLowerCase().startsWith("cancel ")) {
            const id = input.split(" ")[1];
            const userDb = ctx.db.user;
            const reminders = userDb.reminders || [];
            const filtered = reminders.filter(r => r.id !== id);
            if (filtered.length === reminders.length)
                return await ctx.reply(ctx.format.info('No reminder with ID "' + id + '" found.'));
            userDb.reminders = filtered;
            userDb.save();
            return await ctx.reply("✅ Reminder cancelled.");
        }

        // Parse the reminder
        const timeResult = parseTimeInput(input);
        if (!timeResult)
            return await ctx.reply(ctx.format.info(
                'Could not parse the time. Try:\n' +
                '"in 2 hours to check the oven"\n' +
                '"in 30 minutes to take medicine"\n' +
                '"tomorrow at 9am to call mom"'
            ));

        const task = extractReminderText(input);
        const reminderId = ctx.helper.randomUUID().slice(0, 8);
        const fireAt = Date.now() + timeResult.delay;

        // Store in user DB
        const userDb = ctx.db.user;
        if (!userDb.reminders) userDb.reminders = [];
        userDb.reminders.push({ id: reminderId, task, fireAt, createdAt: Date.now() });
        userDb.save();

        // Format the confirmation
        const mins = Math.round(timeResult.delay / 60000);
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        const timeDisplay = hours > 0 
            ? `${hours}h ${remainingMins > 0 ? remainingMins + "m" : ""}`
            : `${mins}m`;

        await ctx.reply(
            `⏰ *REMINDER SET*\n\n` +
            `📝 *Task*: ${task}\n` +
            `⏱️ *When*: In ${timeDisplay}\n` +
            `🆔 *ID*: ${reminderId}\n\n` +
            `_I'll remind you when it's time!_`
        );

        // Set the timeout to fire the reminder
        setTimeout(async () => {
            try {
                // Check if reminder still exists (not cancelled)
                const currentDb = ctx.db.user;
                const currentReminders = currentDb.reminders || [];
                const stillExists = currentReminders.find(r => r.id === reminderId);
                if (!stillExists) return;

                // Remove from DB
                currentDb.reminders = currentReminders.filter(r => r.id !== reminderId);
                currentDb.save();

                // Send the reminder with mention
                const senderJid = ctx.sender.jid;
                await ctx.replyWithJid(ctx.id, {
                    text: `⏰ *REMINDER!*\n\n` +
                        `@${senderJid.split("@")[0]} — it's time!\n\n` +
                        `📝 *Task*: ${task}\n` +
                        `🆔 *ID*: ${reminderId}`,
                    mentions: [senderJid]
                });
            } catch (e) {
                // Silently fail — don't crash on reminder delivery
            }
        }, timeResult.delay);
    }
};
