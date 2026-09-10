module.exports = {
    name: "socialmap",
    aliases: ["smap", "relmap", "whoknows"],
    category: "spicy",
    permissions: { coin: 0, group: false, owner: true },
    code: async (ctx) => {
        try {
            const fs   = require("node:fs");
            const path = require("node:path");
            const sock = ctx.core || ctx.sock || ctx.client;
            const args = ctx.args || [];
            const sub  = args[0]?.toLowerCase();

            const dataDir  = path.join(process.cwd(), "social_map");
            const mapFile  = path.join(dataDir, "graph.json");
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

            const getGraph = () => {
                try { return JSON.parse(fs.readFileSync(mapFile, "utf8")); } catch { return { nodes: {}, edges: {} }; }
            };
            const saveGraph = (g) => fs.writeFileSync(mapFile, JSON.stringify(g, null, 2), "utf8");

            if (!sub) {
                return await ctx.reply(
                    "*Social Map Builder*\n\n" +
                    "`.smap build` — scan all groups, build relationship graph\n" +
                    "`.smap query <number>` — who does this number know?\n" +
                    "`.smap mutual <num1> <num2>` — mutual connections\n" +
                    "`.smap influence <number>` — influence score + network reach\n" +
                    "`.smap top` — most connected numbers across all groups\n" +
                    "`.smap clear` — wipe graph"
                );
            }

            // BUILD
            if (sub === "build") {
                await ctx.reply("🗺️ Building social map — scanning all groups...");

                const allGroups = await sock.groupFetchAllParticipating();
                const graph     = { nodes: {}, edges: {}, groups: {}, builtAt: new Date().toISOString() };
                let   groupCount = 0;

                for (const [gJid, meta] of Object.entries(allGroups)) {
                    const members = meta.participants?.map(p => p.id.split("@")[0]) || [];
                    graph.groups[gJid] = {
                        name: meta.subject,
                        members,
                        memberCount: members.length
                    };

                    // every member is a node
                    members.forEach(num => {
                        if (!graph.nodes[num]) {
                            graph.nodes[num] = {
                                number: num,
                                groups: [],
                                connectionCount: 0
                            };
                        }
                        if (!graph.nodes[num].groups.includes(gJid)) {
                            graph.nodes[num].groups.push(gJid);
                        }
                    });

                    // every pair of members in same group = edge (weighted by shared group count)
                    for (let i = 0; i < members.length; i++) {
                        for (let j = i + 1; j < members.length; j++) {
                            const a = members[i];
                            const b = members[j];
                            const edgeKey = [a, b].sort().join("_");

                            if (!graph.edges[edgeKey]) {
                                graph.edges[edgeKey] = {
                                    a, b,
                                    sharedGroups: [],
                                    weight: 0
                                };
                            }
                            graph.edges[edgeKey].sharedGroups.push(gJid);
                            graph.edges[edgeKey].weight++;
                        }
                    }

                    groupCount++;
                    await new Promise(r => setTimeout(r, 300));
                }

                // compute connection counts
                Object.values(graph.edges).forEach(edge => {
                    if (graph.nodes[edge.a]) graph.nodes[edge.a].connectionCount++;
                    if (graph.nodes[edge.b]) graph.nodes[edge.b].connectionCount++;
                });

                saveGraph(graph);

                await ctx.reply(
                    `✅ Social map built.\n\n` +
                    `Groups scanned: ${groupCount}\n` +
                    `Nodes (people): ${Object.keys(graph.nodes).length}\n` +
                    `Edges (connections): ${Object.keys(graph.edges).length}\n\n` +
                    `Run \`.smap query <number>\` to explore.`
                );
                return;
            }

            // QUERY
            if (sub === "query") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const graph = getGraph();
                const node  = graph.nodes[number];
                if (!node) return await ctx.reply(`❌ +${number} not in graph. Run .smap build first.`);

                // find all connections
                const connections = Object.values(graph.edges)
                    .filter(e => e.a === number || e.b === number)
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 20);

                const connLines = connections.map((e, i) => {
                    const other = e.a === number ? e.b : e.a;
                    const groups = e.sharedGroups.map(g => graph.groups[g]?.name || g).join(", ");
                    return `${i+1}. +${other} (${e.weight} shared groups)\n   via: ${groups}`;
                });

                const groupNames = node.groups
                    .map(g => graph.groups[g]?.name || g)
                    .slice(0, 10);

                await ctx.reply(
                    `*Social Map — +${number}*\n\n` +
                    `*»* *OVERVIEW*\n` +
                    `  › Total connections: ${node.connectionCount}\n` +
                    `  › Groups: ${node.groups.length}\n\n` +
                    `*»* *TOP CONNECTIONS*\n` +
                    connLines.join("\n\n") + "\n\n" +
                    `*»* *SHARED GROUPS*\n` +
                    groupNames.map(g => `  • ${g}`).join("\n")
                );
                return;
            }

            // MUTUAL
            if (sub === "mutual") {
                const num1 = args[1]?.replace(/[^0-9]/g, "");
                const num2 = args[2]?.replace(/[^0-9]/g, "");
                if (!num1 || !num2) return await ctx.reply("❌ Provide two numbers.");

                const graph = getGraph();
                const n1    = graph.nodes[num1];
                const n2    = graph.nodes[num2];

                if (!n1 || !n2) return await ctx.reply("❌ One or both numbers not in graph.");

                // find mutual connections — people connected to both
                const n1Connections = new Set(
                    Object.values(graph.edges)
                        .filter(e => e.a === num1 || e.b === num1)
                        .map(e => e.a === num1 ? e.b : e.a)
                );

                const n2Connections = new Set(
                    Object.values(graph.edges)
                        .filter(e => e.a === num2 || e.b === num2)
                        .map(e => e.a === num2 ? e.b : e.a)
                );

                const mutuals = [...n1Connections].filter(n => n2Connections.has(n));

                // direct edge between them
                const directKey  = [num1, num2].sort().join("_");
                const directEdge = graph.edges[directKey];

                await ctx.reply(
                    `*Mutual Connections*\n` +
                    `+${num1} ↔ +${num2}\n\n` +
                    `Direct connection: ${directEdge ? `Yes (${directEdge.weight} shared groups)` : "No"}\n` +
                    `Mutual contacts: ${mutuals.length}\n\n` +
                    (mutuals.length
                        ? `*Top mutuals:*\n` + mutuals.slice(0, 15).map((m, i) => `${i+1}. +${m}`).join("\n")
                        : "No mutual contacts found.")
                );
                return;
            }

            // INFLUENCE
            if (sub === "influence") {
                const number = args[1]?.replace(/[^0-9]/g, "");
                if (!number) return await ctx.reply("❌ Provide a number.");

                const graph = getGraph();
                const node  = graph.nodes[number];
                if (!node) return await ctx.reply(`❌ +${number} not in graph.`);

                // influence = direct connections + second-degree reach
                const directConns = Object.values(graph.edges)
                    .filter(e => e.a === number || e.b === number)
                    .map(e => e.a === number ? e.b : e.a);

                const secondDegree = new Set();
                directConns.forEach(conn => {
                    Object.values(graph.edges)
                        .filter(e => (e.a === conn || e.b === conn) && e.a !== number && e.b !== number)
                        .forEach(e => {
                            secondDegree.add(e.a === conn ? e.b : e.a);
                        });
                });

                // remove direct connections from second degree
                directConns.forEach(c => secondDegree.delete(c));
                secondDegree.delete(number);

                const totalReach    = directConns.length + secondDegree.size;
                const totalNodes    = Object.keys(graph.nodes).length;
                const influencePct  = totalNodes > 0
                    ? ((totalReach / totalNodes) * 100).toFixed(1)
                    : 0;

                // rank among all nodes
                const ranked = Object.entries(graph.nodes)
                    .sort((a, b) => b[1].connectionCount - a[1].connectionCount);
                const rank = ranked.findIndex(([n]) => n === number) + 1;

                await ctx.reply(
                    `*Influence Score — +${number}*\n\n` +
                    `*»* *REACH*\n` +
                    `  › Direct connections: ${directConns.length}\n` +
                    `  › 2nd degree reach: ${secondDegree.size}\n` +
                    `  › Total network reach: ${totalReach}\n` +
                    `  › Network coverage: ${influencePct}%\n` +
                    `  › Rank: #${rank} of ${totalNodes} people\n\n` +
                    `*»* *ASSESSMENT*\n` +
                    `  ${influencePct > 30 ? "🔴 High influence — key node" :
                        influencePct > 15 ? "🟠 Medium influence — well connected" :
                        influencePct > 5  ? "🟡 Low-medium influence" :
                                            "⚪ Low influence — peripheral node"}`
                );
                return;
            }

            // TOP
            if (sub === "top") {
                const graph = getGraph();
                const nodes = Object.values(graph.nodes)
                    .sort((a, b) => b.connectionCount - a.connectionCount)
                    .slice(0, 20);

                if (!nodes.length) return await ctx.reply("❌ Graph empty. Run .smap build first.");

                const lines = nodes.map((n, i) =>
                    `${i+1}. +${n.number} — ${n.connectionCount} connections, ${n.groups.length} groups`
                );

                await ctx.reply(
                    `*Top 20 Most Connected*\n\n` +
                    lines.join("\n")
                );
                return;
            }

            // CLEAR
            if (sub === "clear") {
                if (fs.existsSync(mapFile)) fs.unlinkSync(mapFile);
                await ctx.reply("✅ Social map cleared.");
                return;
            }

            await ctx.reply("❌ Unknown subcommand. Type `.smap` for help.");

        } catch (e) {
            console.error("[socialmap]", e);
            await ctx.reply("❌ " + e.message);
        }
    }
};