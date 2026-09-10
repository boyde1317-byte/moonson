module.exports = {
    name: "thisday",
    aliases: ["todayhistory", "onthisday", "thisdayin"],
    category: "primbon",
    permissions: {
        coin: 3
    },

    code: async (ctx) => {
        try {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            const apiUrl = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`;
            const { data: res } = await ctx.request.get(apiUrl, {
                headers: { "User-Agent": "MoonsonBot/1.0" }
            });

            if (!res?.events?.length)
                return await ctx.reply(ctx.format.info("No historical events found for today."));

            // Get top 5 events sorted by year (newest first)
            const events = res.events
                .sort((a, b) => b.year - a.year)
                .slice(0, 5);

            const dateStr = now.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                timeZone: "Africa/Accra"
            });

            let caption = `📅 *THIS DAY IN HISTORY*\n*${dateStr}*\n\n`;

            events.forEach((event, i) => {
                const text = event.text.length > 200 ? event.text.slice(0, 197) + "..." : event.text;
                caption += `${i + 1}. *${event.year}* — ${text}\n\n`;
            });

            caption += `📖 ${ctx.format.bold("Wikipedia — On This Day")}`;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
