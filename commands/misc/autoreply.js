module.exports = {
    name: "autoreply",
    aliases: ["autoresponse", "setreply", "ar"],
    category: "misc",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const input = ctx.text;
        const senderDb = ctx.db.user;

        // No input: show current
        if (!input) {
            const ar = senderDb?.autoreply;
            if (!ar?.enabled)
                return await ctx.reply(
                    `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "on I'm busy right now!")}\n\n` +
                    ctx.format.generateNotes([
                        "Set an auto-reply message for when you're away",
                        "on <message> — enable auto-reply",
                        "off — disable auto-reply",
                        "status — check current status"
                    ])
                );

            return await ctx.reply(
                `📤 *AUTO-REPLY STATUS*\n\n` +
                `❯ Status: ${ar.enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
                `❯ Message: ${ar.message || "Not set"}\n` +
                `❯ Set: ${new Date(ar.setAt || Date.now()).toLocaleString("en-US", { timeZone: "Africa/Accra" })}`
            );
        }

        const cmd = input.split(" ")[0]?.toLowerCase();
        const rest = input.slice(cmd.length).trim();

        if (cmd === "off" || cmd === "disable") {
            if (!senderDb.autoreply) senderDb.autoreply = {};
            senderDb.autoreply.enabled = false;
            senderDb.save();
            return await ctx.reply(ctx.format.info("Auto-reply disabled!"));
        }

        if (cmd === "status") {
            const ar = senderDb?.autoreply;
            if (!ar?.enabled)
                return await ctx.reply(ctx.format.info("Auto-reply is currently disabled."));

            return await ctx.reply(
                `📤 *AUTO-REPLY STATUS*\n\n` +
                `❯ Status: ✅ Enabled\n` +
                `❯ Message: ${ar.message}\n`
            );
        }

        if (cmd === "on" || cmd === "enable") {
            if (!rest)
                return await ctx.reply(ctx.format.info("Please provide a message! Example: autoreply on I'm busy!"));

            if (rest.length > 200)
                return await ctx.reply(ctx.format.info("Message too long! Maximum 200 characters."));

            if (!senderDb.autoreply) senderDb.autoreply = {};
            senderDb.autoreply.enabled = true;
            senderDb.autoreply.message = rest;
            senderDb.autoreply.setAt = Date.now();
            senderDb.save();

            return await ctx.reply(
                `✅ *AUTO-REPLY ENABLED*\n\n` +
                `❯ Message: ${rest}\n\n` +
                `_I'll auto-reply when someone messages you!_`
            );
        }

        // Default: treat entire input as message with auto-enable
        if (input.length > 200)
            return await ctx.reply(ctx.format.info("Message too long! Maximum 200 characters."));

        if (!senderDb.autoreply) senderDb.autoreply = {};
        senderDb.autoreply.enabled = true;
        senderDb.autoreply.message = input;
        senderDb.autoreply.setAt = Date.now();
        senderDb.save();

        await ctx.reply(
            `✅ *AUTO-REPLY ENABLED*\n\n` +
            `❯ Message: ${input}\n\n` +
            `_I'll auto-reply when someone messages you!_`
        );
    }
};
