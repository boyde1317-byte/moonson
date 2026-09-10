// commands/store.js
module.exports = {
    name: "store",
    aliases: ["shop", "servers", "hosting"],
    category: "main",

    code: async (ctx) => {
        try {
            const prefix = ctx.used.prefix;

            // ─── Pterodactyl Server Plans ───
            const storeList = [
                {
                    name: "1GB RAM Server",
                    role: "Pterodactyl",
                    price: "10 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "2GB RAM Server",
                    role: "Pterodactyl",
                    price: "20 GHS",
                    sale_price: "Buy Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "3GB RAM Server",
                    role: "Pterodactyl",
                    price: "30 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "4GB RAM Server",
                    role: "Pterodactyl",
                    price: "40 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "5GB RAM Server",
                    role: "Pterodactyl",
                    price: "50 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "6GB RAM Server",
                    role: "Pterodactyl",
                    price: "60 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "7GB RAM Server",
                    role: "Pterodactyl",
                    price: "70 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "8GB RAM Server",
                    role: "Pterodactyl",
                    price: "80 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "9GB RAM Server",
                    role: "Pterodactyl",
                    price: "90 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "10GB RAM Server",
                    role: "Pterodactyl",
                    price: "100 GHS",
                    sale_price: "Order Now",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                },
                {
                    name: "Unlimited RAM Server",
                    role: "Premium",
                    price: "150 GHS",
                    sale_price: "🔥 Best Deal",
                    image: "https://raw.githubusercontent.com/boyde1317-byte/moonson/main/assets/images/server-hosting.jpg"
                }
            ];

            // ─── Top Package ───
            const top = storeList[0];
            const rest = storeList.slice(1);

            // ─── Full List Text ───
            const listText =
                storeList
                    .map((item, i) => {
                        const num = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                        return `${num} *${item.name}* — ${item.price}`;
                    })
                    .join("\n");

            await new AIRich(ctx.core)
                // ─── Top Package ───
                .addProduct({
                    title: top.name,
                    brand: top.role,
                    price: top.price,
                    sale_price: top.sale_price,
                    url: config.bot?.groupLink || "https://wa.me",
                    image: top.image,
                    icon: top.image
                })

                // ─── Other Packages ───
                .addProduct(rest.map((item) => ({
                    title: item.name,
                    brand: item.role,
                    price: item.price,
                    sale_price: item.sale_price,
                    url: config.bot?.groupLink || "https://wa.me",
                    image: item.image,
                    icon: item.image
                })))

                // ─── Full List ───
                .addText(
                    `\`Moonson Pterodactyl Server Store\` 🖥️\n` +
                    `${listText}\n\n` +
                    `High-performance Pterodactyl servers hosted on AizenPanel.\n` +
                    `Prices starting from *10 GHS* to *150 GHS*.\n\n` +
                    `All plans include:\n` +
                    `» Full Root Access\n` +
                    `» 24/7 Uptime\n` +
                    `» Free SSL\n` +
                    `» Dedicated IP\n` +
                    `» One-Click Apps\n` +
                    `» Instant Setup\n\n` +
                    `💡 *Upgrade anytime!* Contact the owner for custom plans.\n\n` +
                    `Your server, your rules. ♥︎`
                )

                // ─── Tip ───
                .addTip("Moonson: © Moonson by Moonson Aizen")

                // ─── Quick Actions ───
                .addSuggest([
                    `${prefix}buy`,
                    `${prefix}price`,
                    `${prefix}owner`
                ])

                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });

        } catch (error) {
            await tools.cmd.handleError(ctx, error);
        }
    }
};