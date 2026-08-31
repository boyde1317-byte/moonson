const { config } = global;

/**
 * Welcome System Toggle — Controls the built-in welcome/goodbye handler.
 * Uses the existing event system: groupDb.option.welcome + groupDb.text.welcome
 */

module.exports = {
    name: "welcome",
    aliases: ["welcomemsg", "setwelcome", "welcomesys"],
    category: "group",
    permissions: {
        coin: 0,
        admin: true
    },

    code: async (ctx) => {
        const input = (ctx.text || "").toLowerCase().trim();
        const groupDb = ctx.db.group;

        if (!input || input === "status") {
            const enabled = groupDb?.option?.welcome === true;
            const welcomeText = groupDb?.text?.welcome || "Default (auto-generated)";
            const goodbyeText = groupDb?.text?.goodbye || "Default (auto-generated)";
            const intro = groupDb?.text?.intro || "None";
            
            return await ctx.reply(
                "👋 *WELCOME SYSTEM*\n\n" +
                `❯ *Status*: ${enabled ? "✅ Enabled" : "❌ Disabled"}\n` +
                `❯ *Welcome Text*: ${welcomeText}\n` +
                `❯ *Goodbye Text*: ${goodbyeText}\n` +
                `❯ *Intro Text*: ${intro}\n\n` +
                "*Commands:*\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "welcome on") + " — Enable\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "welcome off") + " — Disable\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "welcome set <text>") + " — Custom welcome text\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "welcome goodbye <text>") + " — Custom goodbye text\n" +
                "❯ " + ctx.format.inlineCode(ctx.used.prefix + "welcome intro <text>") + " — Group intro shown after welcome\n\n" +
                "*Placeholders:* %tag% (user mention), %subject% (group name), %description% (group desc)"
            );
        }

        if (input === "on" || input === "enable") {
            if (!groupDb.option) groupDb.option = {};
            groupDb.option.welcome = true;
            groupDb.save();
            return await ctx.reply("✅ Welcome system enabled! New members will be greeted automatically.");
        }

        if (input === "off" || input === "disable") {
            if (!groupDb.option) groupDb.option = {};
            groupDb.option.welcome = false;
            groupDb.save();
            return await ctx.reply("❌ Welcome system disabled.");
        }

        if (input.startsWith("set ")) {
            const customText = ctx.text.slice(4).trim();
            if (!groupDb.text) groupDb.text = {};
            groupDb.text.welcome = customText || null;
            groupDb.save();
            return await ctx.reply(
                "✅ Custom welcome text set!\n\n" +
                `Preview: ${customText ? customText.replace(/%tag%/g, "@user").replace(/%subject%/g, ctx.id) : "(default auto-generated)"}`
            );
        }

        if (input.startsWith("goodbye ")) {
            const customText = ctx.text.slice(8).trim();
            if (!groupDb.text) groupDb.text = {};
            groupDb.text.goodbye = customText || null;
            groupDb.save();
            return await ctx.reply("✅ Custom goodbye text set!");
        }

        if (input.startsWith("intro ")) {
            const customText = ctx.text.slice(6).trim();
            if (!groupDb.text) groupDb.text = {};
            groupDb.text.intro = customText || null;
            groupDb.save();
            return await ctx.reply("✅ Group intro text set! Will be shown after welcome message.");
        }

        if (input === "reset") {
            if (!groupDb.text) groupDb.text = {};
            if (!groupDb.option) groupDb.option = {};
            groupDb.text.welcome = null;
            groupDb.text.goodbye = null;
            groupDb.text.intro = null;
            groupDb.option.welcome = true;
            groupDb.save();
            return await ctx.reply("✅ Welcome system reset to defaults.");
        }

        await ctx.reply(ctx.format.info("Unknown option. Use: on, off, set <text>, goodbye <text>, intro <text>, reset, or status"));
    }
};
