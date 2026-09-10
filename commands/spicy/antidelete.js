// drop this in commands/spicy/antidelete.js
// then register the event listener in events/ or inline via bot.on

module.exports = {
    name: "antidelete",
    aliases: ["antidel", "ad"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const db = ctx.db || global.db;
            const current = db.get("bot.antidelete") || false;
            db.set("bot.antidelete", !current);
            await ctx.reply(`Anti-Delete: ${!current ? "✅ ON" : "❌ OFF"}`);
        } catch (e) {
            await ctx.reply("❌ " + e.message);
        }
    }
};