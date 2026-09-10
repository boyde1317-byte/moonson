module.exports = {
    name: "trustdestroy",
    aliases: ["td", "conflictseed", "trustkill"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const sock = ctx.core || ctx.sock || ctx.client;
            const fs   = require("node:fs");
            const path = require("node:path");
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const dataDir = path.join(process.cwd(), "trust_ops");
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

            if (!sub) {
                return await ctx.reply(
                    "*Trust Destroyer — Conflict Engine*\n\n" +
                    "`.td seed <num1> <num2> <message>` — send message as num1 to num2\n" +
                    "`.td crossseed <num1> <num2> <msg>` — send conflicting versions to both\n" +
                    "`.td auto <num1> <num2>` — auto-generate conflict using learned styles\n" +
                    "`.td groupseed <groupJid> <message>` — send different versions to each member\n" +
                    "`.td chain <num1> <num2> <num3> <message>` — create a message chain blaming num2\n" +
                    "`.td log` — view all operations"
                );
            }

            const logOp = (op) => {
                const logFile = path.join(dataDir, "ops.json");
                let ops = [];
                try { ops = JSON.parse(fs.readFileSync(logFile, "utf8")); } catch {}
                ops.push({ ...op, ts: new Date().toISOString() });
                fs.writeFileSync(logFile, JSON.stringify(ops, null, 2), "utf8");
            };

            // SEED — send message as num1 to num2
            if (sub === "seed") {
                const num1    = args[1]?.replace(/[^0-9]/g, "");
                const num2    = args[2]?.replace(/[^0-9]/g, "");
                const message = args.slice(3).join(" ");

                if (!num1 || !num2 || !message) {
                    return await ctx.reply("❌ Usage: .td seed <num1> <num2> <message>");
                }

                await sock.relayMessage(
                    `${num2}@s.whatsapp.net`,
                    { conversation: message },
                    {
                        messageId: `TD_${Date.now()}`,
                        participant: `${num1}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num1}@s.whatsapp.net` }
                    }
                );

                logOp({ type: "seed", from: num1, to: num2, message });
                await ctx.reply(`✅ Seeded conflict.\n+${num1} → +${num2}: "${message}"`);
                return;
            }

            // CROSSSEED — send conflicting versions to both
            if (sub === "crossseed") {
                const num1    = args[1]?.replace(/[^0-9]/g, "");
                const num2    = args[2]?.replace(/[^0-9]/g, "");
                const message = args.slice(3).join(" ");

                if (!num1 || !num2 || !message) {
                    return await ctx.reply("❌ Usage: .td crossseed <num1> <num2> <message>");
                }

                // send to num2 as if from num1
                await sock.relayMessage(
                    `${num2}@s.whatsapp.net`,
                    { conversation: message },
                    {
                        messageId: `TD_${Date.now()}`,
                        participant: `${num1}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num1}@s.whatsapp.net` }
                    }
                );

                await new Promise(r => setTimeout(r, 500));

                // send opposite version to num1 as if from num2
                const opposite = reverseMessage(message);
                await sock.relayMessage(
                    `${num1}@s.whatsapp.net`,
                    { conversation: opposite },
                    {
                        messageId: `TD_${Date.now()}_R`,
                        participant: `${num2}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num2}@s.whatsapp.net` }
                    }
                );

                logOp({ type: "crossseed", num1, num2, message, opposite });
                await ctx.reply(
                    `✅ Cross-seed fired.\n` +
                    `+${num1} → +${num2}: "${message}"\n` +
                    `+${num2} → +${num1}: "${opposite}"`
                );
                return;
            }

            // AUTO — use impersonation profiles to generate conflict
            if (sub === "auto") {
                const num1 = args[1]?.replace(/[^0-9]/g, "");
                const num2 = args[2]?.replace(/[^0-9]/g, "");

                if (!num1 || !num2) {
                    return await ctx.reply("❌ Usage: .td auto <num1> <num2>\n(Both must have impersonation profiles — run .imp learn first)");
                }

                const impDir = path.join(process.cwd(), "impersonation");

                const getImpProfile = (n) => {
                    const f = path.join(impDir, `${n}.json`);
                    try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
                };

                const p1 = getImpProfile(num1);
                const p2 = getImpProfile(num2);

                if (!p1 || p1.messages.length < 5) {
                    return await ctx.reply(`❌ Not enough data for +${num1}. Run .imp learn ${num1} first.`);
                }

                // generate conflict messages using their vocab
                const conflictTemplates = [
                    "bro i dont trust [TARGET] anymore ngl",
                    "you know what [TARGET] said about you right",
                    "nah [TARGET] been talking behind your back fr",
                    "i heard [TARGET] wants to remove you from the group",
                    "[TARGET] said you're the problem in this group",
                    "why does [TARGET] keep lying to everyone bro",
                    "i dont wanna be involved but [TARGET] said some shit about you"
                ];

                const template = conflictTemplates[Math.floor(Math.random() * conflictTemplates.length)];
                const msg1to2  = template.replace("[TARGET]", `+${num1}`);
                const msg2to1  = template.replace("[TARGET]", `+${num2}`);

                // apply style if we have profiles
                const applyBasicStyle = (text, profile) => {
                    if (!profile?.messages?.length) return text;
                    const sample = profile.messages[Math.floor(Math.random() * profile.messages.length)].text;
                    const isLower = sample === sample.toLowerCase();
                    return isLower ? text.toLowerCase() : text;
                };

                const styled1to2 = applyBasicStyle(msg1to2, p1);
                const styled2to1 = applyBasicStyle(msg2to1, p2);

                // fire both directions
                await sock.relayMessage(
                    `${num2}@s.whatsapp.net`,
                    { conversation: styled1to2 },
                    {
                        messageId: `TD_AUTO_${Date.now()}`,
                        participant: `${num1}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num1}@s.whatsapp.net` }
                    }
                );

                await new Promise(r => setTimeout(r, 800));

                await sock.relayMessage(
                    `${num1}@s.whatsapp.net`,
                    { conversation: styled2to1 },
                    {
                        messageId: `TD_AUTO_${Date.now()}_R`,
                        participant: `${num2}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num2}@s.whatsapp.net` }
                    }
                );

                logOp({ type: "auto", num1, num2, msg1to2: styled1to2, msg2to1: styled2to1 });

                await ctx.reply(
                    `✅ Auto conflict seeded.\n\n` +
                    `Sent to +${num2} (as +${num1}):\n"${styled1to2}"\n\n` +
                    `Sent to +${num1} (as +${num2}):\n"${styled2to1}"`
                );
                return;
            }

            // GROUPSEED — different version to each member
            if (sub === "groupseed") {
                const groupJid = args[1];
                const message  = args.slice(2).join(" ");

                if (!groupJid?.endsWith("@g.us") || !message) {
                    return await ctx.reply("❌ Usage: .td groupseed <groupJid> <message>");
                }

                const meta    = await sock.groupMetadata(groupJid);
                const botJid  = sock.user?.id?.replace(/:.*@/, "@") || "";
                const members = meta.participants.filter(p => p.id !== botJid);

                await ctx.reply(`🌀 Group-seeding ${members.length} members with unique versions...`);

                let sent = 0;
                for (const p of members) {
                    // generate a slightly different version for each member
                    const variant = generateVariant(message, p.id.split("@")[0]);

                    await sock.sendMessage(p.id, { text: variant });
                    sent++;
                    await new Promise(r => setTimeout(r, 1200));
                }

                logOp({ type: "groupseed", groupJid, baseMessage: message, sent });
                await ctx.reply(`✅ Group-seeded ${sent} members with unique message variants.\nEach member got a slightly different version — breeds paranoia naturally.`);
                return;
            }

            // CHAIN — create blame chain
            if (sub === "chain") {
                const num1    = args[1]?.replace(/[^0-9]/g, "");
                const num2    = args[2]?.replace(/[^0-9]/g, "");
                const num3    = args[3]?.replace(/[^0-9]/g, "");
                const message = args.slice(4).join(" ");

                if (!num1 || !num2 || !num3 || !message) {
                    return await ctx.reply("❌ Usage: .td chain <num1> <num2> <num3> <message>\nCreates: num1 tells num3 that num2 said the message");
                }

                // num1 → num3: "num2 said: [message]"
                const chainMsg = `yo +${num2} said "${message}" about you`;

                await sock.relayMessage(
                    `${num3}@s.whatsapp.net`,
                    { conversation: chainMsg },
                    {
                        messageId: `TD_CHAIN_${Date.now()}`,
                        participant: `${num1}@s.whatsapp.net`,
                        additionalAttributes: { participant: `${num1}@s.whatsapp.net` }
                    }
                );

                logOp({ type: "chain", num1, num2, num3, message, chainMsg });
                await ctx.reply(
                    `✅ Blame chain created.\n\n` +
                    `+${num1} told +${num3}:\n"${chainMsg}"\n\n` +
                    `+${num3} now thinks +${num2} said: "${message}"`
                );
                return;
            }

            // LOG
            if (sub === "log") {
                const logFile = path.join(dataDir, "ops.json");
                let ops = [];
                try { ops = JSON.parse(fs.readFileSync(logFile, "utf8")); } catch {}

                if (!ops.length) return await ctx.reply("📭 No operations logged yet.");

                const lines = ops.slice(-10).reverse().map((op, i) =>
                    `${i+1}. [${op.type}] ${new Date(op.ts).toLocaleString("en-GB")}`
                );

                await ctx.reply(`*Last 10 Trust Ops*\n\n${lines.join("\n")}`);
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.td` for help.");

        } catch (e) {
            console.error("[trustdestroyer]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};

// generate slightly different version of a message
function generateVariant(message, seed) {
    const variants = [
        message,
        message + " btw",
        "bro " + message,
        message.replace("you", "u").replace("are", "r"),
        message + " lol",
        message + " ngl",
        "nah " + message,
        message + " fr fr"
    ];
    const idx = parseInt(seed.slice(-2), 10) % variants.length;
    return variants[idx];
}

// reverse the sentiment of a message
function reverseMessage(message) {
    const reversals = [
        [/i like you/gi, "i don't like you"],
        [/i trust you/gi, "i don't trust you"],
        [/you're cool/gi, "you're not cool"],
        [/good/gi, "bad"],
        [/love/gi, "hate"],
        [/respect/gi, "no respect for"],
        [/friend/gi, "enemy"],
        [/help/gi, "expose"]
    ];

    let reversed = message;
    for (const [find, replace] of reversals) {
        reversed = reversed.replace(find, replace);
    }

    // if no reversals matched, just negate it
    if (reversed === message) {
        reversed = "nah " + message + " is cap";
    }

    return reversed;
}