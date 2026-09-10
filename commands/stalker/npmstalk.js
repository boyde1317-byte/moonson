module.exports = {
    name: "npmstalk",
    aliases: ["npmpkg", "npmpackage"],
    category: "stalker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                ctx.format.generateInstruction(["send"], ["text"]) + "\n" +
                ctx.format.generateCmdExample(ctx.used, "express")
            );

        try {
            // Direct NPM registry API (free, no key)
            const apiUrl = "https://registry.npmjs.org/" + encodeURIComponent(input);
            const { data: res } = await ctx.request.get(apiUrl);

            if (!res?.name)
                return await ctx.reply(ctx.format.info('No NPM package found for "' + input + '".'));

            const latestVersion = res["dist-tags"]?.latest || "N/A";
            const latestData = res.versions?.[latestVersion] || {};
            const name = res.name;
            const description = latestData.description || "No description available";
            const author = typeof latestData.author === "object"
                ? (latestData.author.name || "Unknown")
                : (latestData.author || "Unknown");
            const license = latestData.license || "N/A";
            const homepage = latestData.homepage || "N/A";
            const keywords = latestData.keywords?.length
                ? latestData.keywords.join(", ")
                : "N/A";
            const maintainers = latestData.maintainers?.length
                ? latestData.maintainers.map(m => m.name).join(", ")
                : "N/A";

            // Get repo info
            const repo = latestData.repository;
            const repoUrl = typeof repo === "object" ? repo.url : (repo || "N/A");

            // Get time data
            const time = res.time || {};
            const created = time.created ? time.created.slice(0, 10) : "N/A";
            const modified = time.modified ? time.modified.slice(0, 10) : "N/A";

            // Get download counts (optional, via npm download API)
            let downloads = "N/A";
            try {
                const dlUrl = "https://api.npmjs.org/downloads/point/last-week/" + encodeURIComponent(input);
                const { data: dlRes } = await ctx.request.get(dlUrl);
                if (dlRes?.downloads) downloads = dlRes.downloads.toLocaleString() + " (last week)";
            } catch (e) { /* optional */ }

            const caption =
                "📦 *NPM PACKAGE*\n\n" +
                "❯ *Name*: " + name + "\n" +
                "❯ *Version*: " + latestVersion + "\n" +
                "❯ *Description*: " + description + "\n" +
                "❯ *Author*: " + author + "\n" +
                "❯ *License*: " + license + "\n" +
                "❯ *Keywords*: " + keywords + "\n" +
                "❯ *Maintainers*: " + maintainers + "\n" +
                "❯ *Homepage*: " + homepage + "\n" +
                "❯ *Repository*: " + repoUrl + "\n" +
                "❯ *Downloads*: " + downloads + "\n" +
                "❯ *Created*: " + created + "\n" +
                "❯ *Modified*: " + modified + "\n\n" +
                "🔗 https://npmjs.com/package/" + name;

            await ctx.reply(caption);
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
