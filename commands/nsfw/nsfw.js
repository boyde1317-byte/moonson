module.exports = {
    name: "nsfw",
    aliases: ["nsfwmenu", "nsfwlist"],
    category: "nsfw",
    permissions: {
        coin: 0,
        private: true
    },

    code: async (ctx) => {
        const prefix = ctx.used.prefix;

        const caption =
            `🔞 *NSFW MENU*\n\n` +
            `*Available Categories:*\n\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwwaifu")} — NSFW Waifu\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwneko")} — NSFW Neko\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwtrap")} — NSFW Trap\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwblowjob")} — Blowjob\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwhentai")} — Hentai\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwboobs")} — Boobs\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwpussy")} — Pussy\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwanal")} — Anal\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwlesbian")} — Lesbian\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwcum")} — Cum\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwspank")} — Spank\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwthreesome")} — Threesome\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwgif")} — Random NSFW GIF\n` +
            `❯ ${ctx.format.inlineCode(prefix + "nsfwrandom")} — Random (any category)\n\n` +
            `_⚠️ NSFW commands only work in private chats._`;

        await ctx.reply(caption);
    }
};
