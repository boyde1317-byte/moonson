// commands/price.js
module.exports = {
    name: "price",
    aliases: ["belibot", "harga", "sewa", "sewabot", "pricing"],
    category: "information",

    code: async (ctx) => {
        const prefix = ctx.used.prefix;
        const ownerNumber = config.owner?.id || "233533416608";

        const msg =
            `› PRICE LIST\n` +
            `» ${config.bot?.name || "Moonson"}\n\n` +
            `› Bot is FREE on GitHub\n` +
            `› You pay for HOSTING & SUPPORT\n\n` +
            `› Hosting Plans\n` +
            `  Daily   │ 20 GHS\n` +
            `  Weekly  │ 55 GHS\n` +
            `  Monthly │ 120 GHS\n\n` +
            `› Premium Access\n` +
            `  Weekly  │ 35 GHS\n` +
            `  Monthly │ 65 GHS\n\n` +
            `› Payment: Halopesa · M-Pesa · Airtel · Tigo · Mixx · TTCL\n` +
            `› Contact: wa.me/${ownerNumber}\n\n` +
            `${config.msg?.footer || "© Moonson by Moonson Aizen"}`;

        if (typeof ButtonV2 !== "undefined" && ButtonV2) {
            await new ButtonV2(ctx.core)
                .setTitle("› Price List")
                .setBody(msg)
                .setFooter("Tap to take action")
                .setThumbnail("https://media.base44.com/images/public/6a6faa067c8ee05c592007b5/a174ce51a_generated_image.png")
                .addButton("› Contact Owner", `${prefix}owner`)
                .addButton("› Donate", `${prefix}donate`)
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });
        } else {
            await ctx.reply(msg);
        }
    }
};