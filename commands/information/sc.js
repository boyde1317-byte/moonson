// commands/sc.js
module.exports = {
    name: "sc",
    aliases: ["script", "source", "sourcecode"],
    category: "information",

    code: async (ctx) => {
        const prefix = ctx.used.prefix;
        const repoLink = "https://github.com/boyde1317-byte/moonson"; // if you don't remove this thank you!
        const imageUrl = "https://media.base44.com/images/public/6a6faa067c8ee05c592007b5/a174ce51a_generated_image.png";

        const msg =
            `› SOURCE CODE\n\n` +
            `› Repository\n` +
            `  ${repoLink}\n\n` +
            `› Bot is FREE & Open Source\n` +
            `› Star ⭐ & Fork 🍴if you liked the project!\n\n`;
          

        if (typeof ButtonV2 !== "undefined" && ButtonV2) {
            await new ButtonV2(ctx.core)
                .setTitle("› Moonson Script")
                .setBody(msg)
                .setFooter(`© ${config.bot?.name || "Moonson"}`) 
                .setThumbnail(imageUrl)
                .addButton("› Dev", `${prefix}owner`)
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } else {
            await ctx.reply(`${msg}\n\n🔗 ${repoLink}`);
        }
    }
};