const util = require("node:util");
const Baileys = require("baileys");
const { globSync } = require("glob");
const api = require("./api");
const Ctx = require("./ctx");
const format = require("./format");
const helper = require("./helper");
const list = require("./list");
const { detectIntent } = require("./smartRouter");

// Smart Router — per-chat cooldown so it never feels spammy
const routerCooldowns = new Map();
const ROUTER_COOLDOWN_MS = 2 * 60 * 1000;

async function Commands(self, runMiddlewares) {
    const {
        m,
        prefix,
        cmd,
        core
    } = self;

    if (!m.body || Baileys.isJidStatusBroadcast(m.key.remoteJid) || Baileys.isJidNewsletter(m.key.remoteJid)) return;

    const findMatchingCommands = (cmdMap, commandName) => {
        const commands = Array.from(cmdMap?.values() || []);
        return commands.filter(cmd => cmd.name?.toLowerCase() === commandName || (Array.isArray(cmd.aliases) && cmd.aliases.includes(commandName)) || cmd.aliases === commandName);
    };

    const createCtx = (self, client, used, args, text) => {
        return new Ctx({
            used,
            args,
            text,
            self,
            client
        });
    };

    const handleHears = (self, body, messageType) => {
        const allHears = Array.from(self.hearsMap?.values() || []);
        return allHears.filter(hear => hear.name === body || hear.name === messageType || new RegExp(hear.name).test(body) || (Array.isArray(hear.name) && hear.name.includes(body)));
    };

    if (self.force) {
        const args = m.body.split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        const text = args.join(" ");

        if (!commandName) return;

        const matched = findMatchingCommands(cmd, commandName);
        if (!matched.length) return;

        const ctx = createCtx(self, core, {
            prefix: "force",
            command: commandName
        }, args, text);
        if (!await runMiddlewares(ctx)) return;
        matched.forEach(cmd => cmd.code(ctx));
        return;
    }

    const hears = handleHears(self, m.body, m.messageType);
    if (hears.length) {
        const ctx = createCtx(self, core, {
            hears: m.body
        }, [], "");
        hears.forEach(hear => hear.code(ctx));
        return;
    }

    const parsed = helper.parseCommand(prefix, m.body);
    
    // ── Smart Router: Natural Language Intent Detection ──
    // When no command prefix is found, analyze the message for intent
    // and offer interactive buttons to execute the matching command.
    if (!parsed.commandName) {
        try {
            // ── Smart Router gating (keep it smart, not spammy) ──
            const jid = m.key.remoteJid;
            const isGroup = jid.endsWith("@g.us");
            const contextInfo = self.m?.message?.[self.m?.messageType]?.contextInfo;
            const quotedType = contextInfo?.quotedMessage
                ? Object.keys(contextInfo.quotedMessage)[0]
                : null;

            // In groups: only chime in when the bot is mentioned or a URL is present
            if (isGroup) {
                const mentioned = contextInfo?.mentionedJid || [];
                const botJid = core.user?.id ? core.user.id.split(":")[0] : "";
                const botMentioned = botJid && mentioned.some(x => (x || "").split(":")[0] === botJid);
                const hasUrl = /https?:\/\//i.test(m.body);
                if (!botMentioned && !hasUrl) return;
            }

            // Per-chat cooldown — don't re-trigger within 2 minutes
            if ((routerCooldowns.get(jid) || 0) > Date.now()) return;

            const selectedPrefix = Array.isArray(prefix) 
                ? prefix.find(p => p && p !== "") 
                : prefix;

            const intent = detectIntent(m.body, quotedType, selectedPrefix || ".");
            
            if (intent) {
                routerCooldowns.set(jid, Date.now() + ROUTER_COOLDOWN_MS);
                const ctx = createCtx(self, core, {
                    prefix: "smart",
                    command: intent.command || "smart"
                }, intent.args ? [intent.args] : [], intent.args || "");
                
                await ctx.reply({
                    header: intent.caption,
                    content: "",
                    footer: "🌙 Moonson Smart Router",
                    buttons: intent.buttons
                });
                return;
            }
        } catch (e) {
            // Smart router errors should never break the bot
            // Silently continue
        }
        return;
    }

    const matched = findMatchingCommands(cmd, parsed.commandName);
    if (!matched.length) return;

    const ctx = createCtx(self, core, {
        prefix: parsed.selectedPrefix,
        command: parsed.commandName
    }, parsed.args, parsed.text);

    if (!await runMiddlewares(ctx)) return;
    matched.forEach(cmd => cmd.code(ctx));
};

class CommandHandler {
    constructor(bot, path) {
        this._bot = bot;
        this._path = path;
    }

    load(isShowLog = true) {
        if (isShowLog) console.group(util.styleText("cyan", "[i]"), "Command Handler");;

        const files = this._getFiles();

        for (const file of files) {
            try {
                const module = require(file);
                const commands = this._normalizeCommands(module, file);

                for (const cmd of commands) {
                    this._registerCommand(cmd);
                    if (isShowLog) {
                        const type = cmd.type === "hears" ? "Hears" : "Command";
                        console.log(util.styleText("green", "[+]"), `Loaded ${type} - ${cmd.name}`);
                    }
                }
            } catch (error) {
                if (isShowLog) console.warn(util.styleText("yellow", "[!]"), `Failed to load ${file}: ${error}`);
            }
        }

        if (isShowLog) console.groupEnd();
    }

    _getFiles() {
        return globSync("**/*.js", {
            cwd: this._path,
            nodir: true,
            absolute: true
        });
    }

    _normalizeCommands(module, file) {
        if (module.name && (!module.type || module.type === "command" || module.type === "hears")) return [module];
        if (Array.isArray(module)) return module.filter(cmd => cmd.name && (!cmd.type || cmd.type === "command" || cmd.type === "hears"));
        return [];
    }

    _registerCommand(cmd) {
        if (cmd.type === "hears") {
            this._bot.hearsMap.set(cmd.name, cmd);
        } else {
            this._bot.cmd.set(cmd.name, cmd);
        }
    }
}

module.exports = {
    Commands,
    CommandHandler
};
