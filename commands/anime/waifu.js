module.exports = {
    name: "waifu",
    aliases: ["wifu"],
    category: "anime",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = (ctx.text || "").toLowerCase();
        const prefix = ctx.used.prefix;

        // Valid SFW categories from waifu.pics API
        const validCategories = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"];

        const category = validCategories.includes(input) ? input : "waifu";

        try {
            const apiUrl = `https://api.waifu.pics/sfw/${category}`;
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.url)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            const labels = {
                waifu: "Waifu", neko: "Neko", shinobu: "Shinobu", megumin: "Megumin",
                bully: "Bully", cuddle: "Cuddle", cry: "Cry", hug: "Hug", awoo: "Awoo",
                kiss: "Kiss", lick: "Lick", pat: "Pat", smug: "Smug", bonk: "Bonk",
                yeet: "Yeet", blush: "Blush", smile: "Smile", wave: "Wave",
                highfive: "High Five", handhold: "Hand Hold", nom: "Nom", bite: "Bite",
                glomp: "Glomp", slap: "Slap", kill: "Kill", kick: "Kick", happy: "Happy",
                wink: "Wink", poke: "Poke", dance: "Dance", cringe: "Cringe"
            };

            await ctx.reply({
                image: { url: res.url },
                caption: `🌸 *${labels[category] || "Waifu"}*\n` +
                    `❯ Category: ${category}\n\n` +
                    `Want another? Tap below!`,
                buttons: [{
                    text: "🔄 Get Another",
                    id: `${prefix}${ctx.used.command} ${category}`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
