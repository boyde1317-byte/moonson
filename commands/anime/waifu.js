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

        // Categories served by nekos.best (waifu.pics shut down in 2026)
        const validCategories = ["waifu", "neko", "cuddle", "cry", "hug", "kiss", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "slap", "kick", "happy", "wink", "poke", "dance", "pout"];

        // Legacy waifu.pics categories with no live equivalent — remapped to the closest
        const categoryMap = {
            shinobu: "neko",
            megumin: "waifu",
            bully: "smug",
            awoo: "smile",
            lick: "kiss",
            glomp: "hug",
            kill: "slap",
            cringe: "pout"
        };

        const requested = validCategories.includes(input) || categoryMap[input] ? input : "waifu";
        const category = categoryMap[requested] || requested;

        const labels = {
            waifu: "Waifu", neko: "Neko", shinobu: "Neko", megumin: "Waifu", bully: "Smug",
            cuddle: "Cuddle", cry: "Cry", hug: "Hug", awoo: "Smile", kiss: "Kiss",
            lick: "Kiss", pat: "Pat", smug: "Smug", bonk: "Bonk", yeet: "Yeet",
            blush: "Blush", smile: "Smile", wave: "Wave", highfive: "High Five",
            handhold: "Hand Hold", nom: "Nom", bite: "Bite", glomp: "Hug", slap: "Slap",
            kill: "Slap", kick: "Kick", happy: "Happy", wink: "Wink", poke: "Poke",
            dance: "Dance", cringe: "Pout", pout: "Pout"
        };

        try {
            let imageUrl = null;
            let animeName = null;

            // Primary: nekos.best
            try {
                const { data: res } = await ctx.request.get(`https://nekos.best/api/v2/${category}`);
                const result = res?.results?.[0];
                if (result?.url) {
                    imageUrl = result.url;
                    animeName = result.anime_name;
                }
            } catch {}

            // Fallback: nekos.life (subset of categories)
            if (!imageUrl) {
                try {
                    const { data: res } = await ctx.request.get(`https://nekos.life/api/v2/img/${category}`);
                    imageUrl = res?.url;
                } catch {}
            }

            if (!imageUrl)
                return await ctx.reply(ctx.format.info("Could not fetch image. Try again later."));

            const caption = `🌸 *${labels[requested] || labels[category] || "Waifu"}*\n` +
                `❯ Category: ${requested}\n` +
                (animeName && animeName !== "null" ? `❯ Anime: ${animeName}\n` : "") +
                `\nWant another? Tap below!`;

            await ctx.reply({
                image: { url: imageUrl },
                caption,
                buttons: [{
                    text: "🔄 Get Another",
                    id: `${prefix}${ctx.used.command} ${requested}`
                }]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
