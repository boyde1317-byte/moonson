module.exports = {
    name: "ghost",
    aliases: ["ghostmode", "gm", "dossier"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const dataDir = path.join(process.cwd(), "ghost_data");
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

            const trackFile = path.join(dataDir, "targets.json");
            const getTargets = () => {
                try { return JSON.parse(fs.readFileSync(trackFile, "utf8")); } catch { return {}; }
            };
            const saveTargets = (t) => fs.writeFileSync(trackFile, JSON.stringify(t, null, 2), "utf8");

            const getProfile = (number) => {
                const file = path.join(dataDir, `${number}.json`);
                try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch {
                    return {
                        number,
                        name: null,
                        groups: [],
                        presenceLog: [],
                        profilePics: [],
                        statusHistory: [],
                        lastSeen: null,
                        lastStatus: null,
                        typingEvents: [],
                        createdAt: new Date().toISOString()
                    };
                }
            };
            const saveProfile = (number, profile) => {
                const file = path.join(dataDir, `${number}.json`);
                // cap arrays
                if (profile.presenceLog.length > 2000) profile.presenceLog = profile.presenceLog.slice(-2000);
                if (profile.typingEvents.length > 500)  profile.typingEvents = profile.typingEvents.slice(-500);
                fs.writeFileSync(file, JSON.stringify(profile, null, 2), "utf8");
            };

            if (!sub) {
                return await ctx.reply(
                    "*Ghost Mode — Live Target Dossier*\n\n" +
                    "`.ghost add <number>` — start ghosting a target\n" +
                    "`.ghost remove <number>` — stop ghosting\n" +
                    "`.ghost list` — all active targets\n" +
                    "`.ghost status <number>` — live dossier\n" +
                    "`.ghost full <number>` — complete profile dump\n" +
                    "`.ghost pic <number>` — fetch current profile pic\n" +
                    "`.ghost groups <number>` — groups target is in (shared with bot)\n" +
                    "`.ghost clear <number>` — wipe all data"
                );
            }

            // ADD
            if (sub === "add") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const targets = getTargets();
                targets[number] = { addedAt: new Date().toISOString(), active: true };
                saveTargets(targets);

                // subscribe to presence
                await sock.presenceSubscribe(`${number}@s.whatsapp.net`);

                // initial profile pic fetch
                try {
                    const picUrl = await sock.profilePictureUrl(`${number}@s.whatsapp.net`, "image");
                    const profile = getProfile(number);
                    if (!profile.profilePics.includes(picUrl)) {
                        profile.profilePics.push({ url: picUrl, ts: Date.now() });
                    }
                    saveProfile(number, profile);
                } catch {}

                await ctx.reply(`👻 Ghost mode activated on +${number}`);
                return;
            }

            // REMOVE
            if (sub === "remove") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");
                const targets = getTargets();
                delete targets[number];
                saveTargets(targets);
                await ctx.reply(`✅ Stopped ghosting +${number}`);
                return;
            }

            // LIST
            if (sub === "list") {
                const targets = getTargets();
                const nums = Object.keys(targets);
                if (!nums.length) return await ctx.reply("📭 No active targets.");

                const lines = nums.map((n, i) => {
                    const p = getProfile(n);
                    const last = p.lastSeen
                        ? new Date(p.lastSeen).toLocaleString("en-GB")
                        : "never";
                    return `${i+1}. +${n} ${p.name ? `(${p.name})` : ""}\n   Last seen: ${last} — ${p.lastStatus || "unknown"}`;
                });

                await ctx.reply(`*Active Ghost Targets — ${nums.length}*\n\n${lines.join("\n\n")}`);
                return;
            }

            // STATUS — live dossier
            if (sub === "status") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const profile = getProfile(number);
                const jid     = `${number}@s.whatsapp.net`;

                // live presence check
                await sock.presenceSubscribe(jid);
                await new Promise(r => setTimeout(r, 1500));

                // get mutual groups
                let mutualGroups = [];
                try {
                    const allGroups = await sock.groupFetchAllParticipating();
                    for (const [gJid, meta] of Object.entries(allGroups)) {
                        const inGroup = meta.participants?.some(p => p.id.split("@")[0] === number);
                        if (inGroup) mutualGroups.push(meta.subject);
                    }
                } catch {}

                // session analysis
                const online  = profile.presenceLog.filter(e => e.status === "available").length;
                const offline = profile.presenceLog.filter(e => e.status === "unavailable").length;
                const typing  = profile.typingEvents.length;

                const lastSeen   = profile.lastSeen ? new Date(profile.lastSeen).toLocaleString("en-GB") : "unknown";
                const lastStatus = profile.lastStatus || "unknown";

                // activity pattern
                const hourCounts = Array(24).fill(0);
                profile.presenceLog
                    .filter(e => e.status === "available")
                    .forEach(e => hourCounts[new Date(e.ts).getHours()]++);
                const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

                const statusEmoji = {
                    available:   "🟢 Online",
                    unavailable: "🔴 Offline",
                    composing:   "✍️ Typing",
                    recording:   "🎤 Recording",
                    paused:      "⏸️ Paused"
                }[lastStatus] || "⚪ Unknown";

                await ctx.reply(
                    `*👻 Ghost Dossier — +${number}*\n\n` +
                    `*»* *LIVE STATUS*\n` +
                    `  › Status: ${statusEmoji}\n` +
                    `  › Last Seen: ${lastSeen}\n` +
                    `  › Name: ${profile.name || "unknown"}\n\n` +
                    `*»* *ACTIVITY*\n` +
                    `  › Online events: ${online}\n` +
                    `  › Offline events: ${offline}\n` +
                    `  › Typing events: ${typing}\n` +
                    `  › Peak hour: ${peakHour}:00–${peakHour+1}:00\n\n` +
                    `*»* *GROUPS (${mutualGroups.length} shared)*\n` +
                    `  ${mutualGroups.slice(0, 10).join("\n  ") || "none"}\n\n` +
                    `*»* *PROFILE PICS LOGGED*\n` +
                    `  ${profile.profilePics.length} captured`
                );
                return;
            }

            // FULL — complete dump
            if (sub === "full") {
                const number  = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const profile = getProfile(number);
                const file    = path.join(dataDir, `${number}.json`);

                await ctx.reply(`📁 Full profile dump for +${number}:\n\n` + JSON.stringify(profile, null, 2).slice(0, 3000));
                return;
            }

            // PIC
            if (sub === "pic") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                try {
                    const jid    = `${number}@s.whatsapp.net`;
                    const picUrl = await sock.profilePictureUrl(jid, "image");

                    const profile = getProfile(number);
                    const already = profile.profilePics.find(p => p.url === picUrl);
                    if (!already) {
                        profile.profilePics.push({ url: picUrl, ts: Date.now() });
                        saveProfile(number, profile);
                    }

                    await sock.sendMessage(ctx.msg.key.remoteJid, {
                        image: { url: picUrl },
                        caption: `Profile pic — +${number}\nCaptured: ${new Date().toLocaleString("en-GB")}\nTotal logged: ${profile.profilePics.length}`
                    });
                } catch {
                    await ctx.reply("❌ No profile pic available or target has privacy enabled.");
                }
                return;
            }

            // GROUPS
            if (sub === "groups") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const allGroups = await sock.groupFetchAllParticipating();
                const shared = [];

                for (const [gJid, meta] of Object.entries(allGroups)) {
                    const inGroup = meta.participants?.some(p => p.id.split("@")[0] === number);
                    if (inGroup) {
                        const memberCount = meta.participants?.length || 0;
                        const isAdmin = meta.participants?.find(p =>
                            p.id.split("@")[0] === number
                        )?.admin;
                        shared.push({
                            name: meta.subject,
                            jid: gJid,
                            members: memberCount,
                            role: isAdmin ? `[${isAdmin}]` : "[member]"
                        });
                    }
                }

                if (!shared.length) return await ctx.reply(`+${number} shares no groups with bot.`);

                const lines = shared.map((g, i) =>
                    `${i+1}. *${g.name}* ${g.role}\n   Members: ${g.members}\n   JID: ${g.jid}`
                );

                await ctx.reply(
                    `*Groups — +${number}*\n` +
                    `Shared with bot: ${shared.length}\n\n` +
                    lines.join("\n\n")
                );
                return;
            }

            // CLEAR
            if (sub === "clear") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");
                const file = path.join(dataDir, `${number}.json`);
                if (fs.existsSync(file)) fs.unlinkSync(file);
                await ctx.reply(`✅ Ghost data cleared for +${number}`);
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.ghost` for help.");

        } catch (e) {
            console.error("[ghost]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};