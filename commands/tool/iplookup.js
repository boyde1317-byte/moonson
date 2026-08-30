module.exports = {
    name: "iplookup",
    aliases: ["ip", "whois", "domain"],
    category: "tool",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        const input = ctx.text?.trim();

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "8.8.8.8")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "google.com")}\n` +
                ctx.format.generateNotes([
                    "Look up IP address or domain info",
                    "Returns location, ISP, coordinates, and more"
                ])
            );

        try {
            // Check if input is an IP address or domain
            const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input);

            let lookupTarget = input;

            // If it's a domain, resolve to IP first
            if (!isIP) {
                const dns = require("dns").promises;
                try {
                    const addresses = await dns.resolve4(input.replace(/^https?:\/\//, "").split("/")[0]);
                    if (addresses.length > 0) lookupTarget = addresses[0];
                } catch (e) {
                    return await ctx.reply(ctx.format.info(`Could not resolve domain "${input}".`));
                }
            }

            // ip-api.com — free, no key needed (45 req/min limit)
            const apiUrl = `http://ip-api.com/json/${lookupTarget}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
            const res = (await axios.get(apiUrl, { timeout: 15000 })).data;

            if (res.status === "fail") {
                return await ctx.reply(ctx.format.info(`Lookup failed: ${res.message || "Unknown error"}`));
            }

            let text = `🌐 *IP / DOMAIN LOOKUP*\n\n`;
            text += `❯ ${ctx.format.bold("IP")}: ${res.query}\n`;
            text += `❯ ${ctx.format.bold("Country")}: ${res.country} (${res.countryCode || "N/A"})\n`;
            text += `❯ ${ctx.format.bold("Region")}: ${res.regionName || "N/A"}${res.city ? ", " + res.city : ""}\n`;
            if (res.zip) text += `❯ ${ctx.format.bold("Postal Code")}: ${res.zip}\n`;
            text += `❯ ${ctx.format.bold("Timezone")}: ${res.timezone || "N/A"}\n`;
            text += `❯ ${ctx.format.bold("ISP")}: ${res.isp || "N/A"}\n`;
            if (res.org) text += `❯ ${ctx.format.bold("Organization")}: ${res.org}\n`;
            if (res.as) text += `❯ ${ctx.format.bold("AS")}: ${res.as}\n`;
            text += `❯ ${ctx.format.bold("Coordinates")}: ${res.lat}, ${res.lon}\n`;

            // Google Maps link
            if (res.lat && res.lon) {
                text += `❯ ${ctx.format.bold("Map")}: https://maps.google.com/?q=${res.lat},${res.lon}`;
            }

            await ctx.reply(text.trim());
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
