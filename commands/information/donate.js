// commands/donate.js
module.exports = {
    name: "donate",
    aliases: ["donasi", "support"],
    category: "information",

    code: async (ctx) => {
        const prefix = ctx.used.prefix;
        const ownerNumber = config.owner?.id || "233533416608";
        const donateLink = "https://moonson.vercel.app/#pricing";

        const msg =
            `› SUPPORT ${config.bot?.name || "Moonson"}\n\n` +
            `› Donate Online\n` +
            `  ${donateLink}\n\n` +
            `› Manual (All Networks)\n` +
            `  Send to: ${ownerNumber}\n\n` +
            `› Every coin helps! 🙏\n\n`;

        if (typeof ButtonV2 !== "undefined" && ButtonV2) {
            await new ButtonV2(ctx.core)
                .setTitle("› Donate")
                .setBody(msg)
                .setFooter("© Moonson by Moonson Aizen with ♥︎")
                .setThumbnail("https://media.base44.com/images/public/6a6faa067c8ee05c592007b5/a174ce51a_generated_image.png")
                .addButton("› Donate Online", `${prefix}open ${donateLink}`)
                .addButton("› Copy Number", `${prefix}copy ${ownerNumber}`)
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } else {
            await ctx.reply(msg);
        }
    }
};