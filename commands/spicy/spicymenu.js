const os = require("node:os");

module.exports = {
    name: "spicymenu",
    aliases: ["smenu", "spicy", "darkmenu", "sm"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            // ========================================
            // CATALOG
            // ========================================
            const Catalog = {
                key: {
                    remoteJid: '0@s.whatsapp.net',
                    fromMe: false,
                    id: 'Moonson Spicy Catalog',
                    participant: '0@s.whatsapp.net'
                },
                message: {
                    productMessage: {
                        product: {
                            title: '𝐌𝐨𝐨𝐧𝐬𝐨𝐧 𝐒𝐩𝐢𝐜𝐲',
                            description: '𝐃𝐚𝐫𝐤 𝐏𝐚𝐜𝐤 — 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲',
                            currencyCode: 'BTC',
                            priceAmount1000: 100000000,
                            retailerId: 'BTC100000000',
                            productImageCount: 1
                        },
                        businessOwnerJid: '0@s.whatsapp.net'
                    }
                }
            };

            // ========================================
            // THUMBNAIL
            // ========================================
            const thumbnail = "https://media.base44.com/images/public/6a6faa067c8ee05c592007b5/a174ce51a_generated_image.png";

            // ========================================
            // SERVER STATS
            // ========================================
            const cpuLoad  = os.loadavg()[0];
            const cpuCores = os.cpus().length;
            const loadPct  = (cpuLoad / cpuCores) * 100;
            const ramPct   = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
            const serverStatus = loadPct > 80 || ramPct > 85 ? "Degraded" : "Online";

            const totalMem = os.totalmem();
            const freeMem  = os.freemem();
            const usedMem  = totalMem - freeMem;

            const formatRam = (bytes) => {
                const mb = bytes / 1024 / 1024;
                return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
            };

            const createBar = (percent, maxBlocks = 8) => {
                const filled = Math.round((percent / 100) * maxBlocks);
                const empty  = maxBlocks - filled;
                return "█".repeat(Math.min(filled, maxBlocks)) + "░".repeat(Math.min(empty, maxBlocks));
            };

            const cpuBar = createBar(Math.min(loadPct, 100), 10);
            const ramBar = createBar(ramPct, 8);

            // ========================================
            // TIME
            // ========================================
            const nowEN = new Date(
                new Date().toLocaleString("en-US", { timeZone: "Africa/Accra" })
            );
            const timeEN = nowEN.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const dateEN = nowEN.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

            // ========================================
            // UPTIME + GROUPS + CMDS
            // ========================================
            const uptimeMs  = Date.now() - ctx.me.readyAt;
            const uptime    = tools.msg.convertMsToDuration(uptimeMs) || "N/A";
            const totalCmds = Array.from(ctx.bot.cmd.values()).length;

            let totalGroups = 0;
            try {
                const allGroups = await ctx.core.groupFetchAllParticipating().catch(() => ({}));
                totalGroups = Object.keys(allGroups).length;
            } catch (_) {}

            // ========================================
            // FULL CATEGORY MAP — ALL SPICY COMMANDS
            // ========================================
            const categories = {
                group: {
                    label: "👥 Group Tools",
                    cmds: [
                        { name: "scrape",       desc: "Dump all member JIDs + save to file" },
                        { name: "groupinfo",    desc: "Full group metadata dump" },
                        { name: "nuke",         desc: "Kick every non-admin member" },
                        { name: "groupbug",     desc: "Break group UI — types: desc, subject, icon, announce, pin, all" },
                        { name: "metaflood",    desc: "Continuous metadata spam loop" }
                    ]
                },
                broadcast: {
                    label: "📡 Broadcast",
                    cmds: [
                        { name: "broadcast",    desc: "Send message to every group bot is in" },
                        { name: "massdm",       desc: "DM every member of current group" }
                    ]
                },
                invite: {
                    label: "🔗 Invite Links",
                    cmds: [
                        { name: "invharvest",   desc: "Harvest invite links from all groups" },
                        { name: "invrevoke",    desc: "Burn + regenerate all invite links" },
                        { name: "invjoin",      desc: "Bot joins list of WA invite links" }
                    ]
                },
                phish: {
                    label: "🎣 Phishing",
                    cmds: [
                        { name: "phish",        desc: "Start credential phish flow on target" },
                        { name: "phishblast",   desc: "Blast phish flow to entire group" },
                        { name: "phishlog",     desc: "View all collected credentials" }
                    ]
                },
                bug: {
                    label: "🐛 Bug / Crash",
                    cmds: [
                        { name: "bug",          desc: "Crash target WA — types: proto, unicode, sticker, reply, memory, notif, all" },
                        { name: "buggroup",     desc: "Bug every member of current group" },
                        { name: "groupbug",     desc: "Break group UI for all members" },
                        { name: "metaflood",    desc: "Metadata spam — continuous loop" }
                    ]
                },
                inject: {
                    label: "💉 Message Injection",
                    cmds: [
                        { name: "inject",       desc: "Spoof text from any number in group" },
                        { name: "injectmedia",  desc: "Spoof media from any number" },
                        { name: "injectreply",  desc: "Fake reply chain between two numbers" }
                    ]
                },
                surveillance: {
                    label: "👁️ Surveillance",
                    cmds: [
                        { name: "ptrack add",     desc: "Start tracking a number's presence" },
                        { name: "ptrack remove",  desc: "Stop tracking a number" },
                        { name: "ptrack list",    desc: "Show all tracked numbers + last seen" },
                        { name: "ptrack report",  desc: "Activity report for a number" },
                        { name: "presenceheat",   desc: "24h activity heatmap for a number" },
                        { name: "antidelete",     desc: "Toggle deleted message catching" }
                    ]
                },
                botkiller: {
                    label: "🤖 Bot Killer",
                    cmds: [
                        { name: "botkiller scan",    desc: "Scan group for bots" },
                        { name: "botkiller kill",    desc: "Targeted kill on specific bot" },
                        { name: "botkiller killall", desc: "Kill all detected bots in group" },
                        { name: "botkiller stress",  desc: "Stress test all bots in group" }
                    ]
                },
                rotation: {
                    label: "🔄 Number Rotation",
                    cmds: [
                        { name: "autonumber add",    desc: "Add backup number to queue" },
                        { name: "autonumber list",   desc: "Show backup queue" },
                        { name: "autonumber rotate", desc: "Manually trigger rotation" },
                        { name: "autonumber status", desc: "Current number + next in line" }
                    ]
                },
                rep: {
                    label: "💀 Reputation Destroyer",
                    cmds: [
                        { name: "repdestroy target",  desc: "Set target number" },
                        { name: "repdestroy message", desc: "Set message to inject as target" },
                        { name: "repdestroy preview", desc: "Preview before firing" },
                        { name: "repdestroy fire",    desc: "Inject across all groups" }
                    ]
                }
            };

            // ========================================
            // INPUT — category filter
            // ========================================
            const input = ctx.args[0]?.toLowerCase();

            // CATEGORY VIEW
            if (input && categories[input]) {
                const cat = categories[input];
                let text  = "";

                cat.cmds.forEach((c, i) => {
                    const isLast = i === cat.cmds.length - 1;
                    text += `${isLast ? "└•" : "├•"} ${ctx.used.prefix}${c.name}\n`;
                    text += `${isLast ? "   " : "│  "} ↳ ${c.desc}\n`;
                });

                await new ButtonV2(ctx.core)
                    .setTitle("🌶️ " + cat.label)
                    .setSubtitle(`${serverStatus} · ${timeEN}`)
                    .setBody(formatter.monospace(text.trim()))
                    .setFooter(config.msg.footer)
                    .setThumbnail(thumbnail)
                    .setContextInfo({
                        stanzaId: Catalog.key.id,
                        participant: Catalog.key.participant,
                        remoteJid: Catalog.key.remoteJid,
                        quotedMessage: Catalog.message
                    })
                    .addButton("◂ Back", `${ctx.used.prefix}spicymenu`)
                    .addButton("📋 Main Menu", `${ctx.used.prefix}menu`)
                    .addRawButton({
                        buttonText: { displayText: "☰ Categories" },
                        buttonId: "spicymenu_nav",
                        type: 1,
                        nativeFlowInfo: {
                            name: "single_select",
                            paramsJson: JSON.stringify({
                                title: "Spicy Categories",
                                sections: [{
                                    title: "🌶️ Dark Pack",
                                    rows: Object.entries(categories).map(([key, val]) => ({
                                        title: val.label,
                                        description: `${val.cmds.length} commands`,
                                        id: `${ctx.used.prefix}spicymenu ${key}`
                                    }))
                                }]
                            })
                        }
                    })
                    .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });

                return;
            }

            // ========================================
            // MAIN SPICY MENU
            // ========================================
            const totalSpicyCmds = Object.values(categories)
                .reduce((sum, c) => sum + c.cmds.length, 0);

            const bodyText =
                `🌶️ *Spicy Pack — Owner Only*\n` +
                `${dateEN} · ${timeEN}`;

            const footerText =
                `*»* *DARK PACK*\n` +
                `  › *Categories:* ${Object.keys(categories).length}\n` +
                `  › *Total Commands:* ${totalSpicyCmds} spicy cmd\n` +
                `\n` +
                `*»* *PACK INDEX*\n` +
                `  › 👥 Group Tools\n` +
                `  › 📡 Broadcast\n` +
                `  › 🔗 Invite Links\n` +
                `  › 🎣 Phishing\n` +
                `  › 🐛 Bug / Crash\n` +
                `  › 💉 Message Injection\n` +
                `  › 👁️ Surveillance\n` +
                `  › 🤖 Bot Killer\n` +
                `  › 🔄 Number Rotation\n` +
                `  › 💀 Reputation Destroyer\n` +
                `\n` +
                `*»* *SYSTEM*\n` +
                `  › *Status:* ${serverStatus}\n` +
                `  › *Uptime:* ${uptime}\n` +
                `  › *CPU:* ${cpuBar} ${Math.round(Math.min(loadPct, 100))}%\n` +
                `  › *RAM:* ${formatRam(usedMem)}/${formatRam(totalMem)} ${ramBar}\n` +
                `  › *Groups:* ${totalGroups}\n` +
                `  › *All Commands:* ${totalCmds} cmd\n` +
                `\n` +
                `⚠️ Owner only. All commands logged.\n\n` +
                `${config.msg.footer}`;

            await new ButtonV2(ctx.core)
                .setTitle(config.bot.name + " — Spicy")
                .setSubtitle(`${serverStatus} · ${timeEN}`)
                .setBody(bodyText)
                .setFooter(footerText)
                .setThumbnail(thumbnail)
                .setContextInfo({
                    stanzaId: Catalog.key.id,
                    participant: Catalog.key.participant,
                    remoteJid: Catalog.key.remoteJid,
                    quotedMessage: Catalog.message
                })
                .addButton("📋 Main Menu", `${ctx.used.prefix}menu`)
                .addRawButton({
                    buttonText: { displayText: "🌶️ Browse Categories" },
                    buttonId: "spicymenu_main",
                    type: 1,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify({
                            title: "Select Category",
                            sections: [
                                {
                                    title: "🌶️ Offense",
                                    rows: [
                                        {
                                            title: "👥 Group Tools",
                                            description: `${categories.group.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu group`
                                        },
                                        {
                                            title: "📡 Broadcast",
                                            description: `${categories.broadcast.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu broadcast`
                                        },
                                        {
                                            title: "🔗 Invite Links",
                                            description: `${categories.invite.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu invite`
                                        },
                                        {
                                            title: "🎣 Phishing",
                                            description: `${categories.phish.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu phish`
                                        },
                                        {
                                            title: "🐛 Bug / Crash",
                                            description: `${categories.bug.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu bug`
                                        },
                                        {
                                            title: "💉 Message Injection",
                                            description: `${categories.inject.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu inject`
                                        }
                                    ]
                                },
                                {
                                    title: "🌶️ Intelligence",
                                    rows: [
                                        {
                                            title: "👁️ Surveillance",
                                            description: `${categories.surveillance.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu surveillance`
                                        },
                                        {
                                            title: "🤖 Bot Killer",
                                            description: `${categories.botkiller.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu botkiller`
                                        },
                                        {
                                            title: "🔄 Number Rotation",
                                            description: `${categories.rotation.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu rotation`
                                        },
                                        {
                                            title: "💀 Reputation Destroyer",
                                            description: `${categories.rep.cmds.length} commands`,
                                            id: `${ctx.used.prefix}spicymenu rep`
                                        }
                                    ]
                                },
                                {
                                    title: "Navigation",
                                    rows: [
                                        {
                                            title: "Main Menu",
                                            description: "Back to main menu",
                                            id: `${ctx.used.prefix}menu`
                                        },
                                        {
                                            title: "All Commands",
                                            description: "Show all commands",
                                            id: `${ctx.used.prefix}menu all`
                                        },
                                        {
                                            title: "Ping",
                                            description: "Check server response",
                                            id: `${ctx.used.prefix}ping`
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                })
                .send(ctx._msg.key.remoteJid, { quoted: ctx._msg });

        } catch (e) {
            console.error("[spicymenu]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};