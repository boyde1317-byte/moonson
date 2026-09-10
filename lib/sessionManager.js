const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("baileys");
const fs   = require("node:fs");
const path = require("node:path");

const SESSIONS_DIR   = path.join(process.cwd(), "sessions", "extra");
const activeSessions = new Map(); // label → { sock, jid }

// ─── Message handler (shared logic with primary bot) ─────────────
async function handleMessage(sock, label, msg) {
    try {
        // Ignore if no message content
        if (!msg.message) return;
        // Ignore status broadcasts
        if (msg.key.remoteJid === "status@broadcast") return;
        // Ignore messages sent by this session itself
        if (msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const isGroup   = remoteJid.endsWith("@g.us");

        // Extract text
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        if (!text.trim()) return;

        const prefix  = global.config?.system?.prefix || ".";
        const isCmd   = text.startsWith(prefix);

        if (!isCmd) return; // only respond to commands

        const body    = text.slice(prefix.length).trim();
        const [cmdName, ...args] = body.split(/\s+/);
        const command = cmdName.toLowerCase();

        // Build a ctx-like object mirroring what primary bot uses
        const ctx = {
            sock,
            client    : sock,
            jid       : remoteJid,
            isGroup,
            sender    : isGroup
                ? msg.key.participant
                : remoteJid,
            args,
            command,
            prefix,
            msg,
            ownerNumber: global.config?.bot?.phoneNumber || "",
            reply: async (text) => {
                await sock.sendMessage(remoteJid, { text }, { quoted: msg });
            },
            react: async (emoji) => {
                await sock.sendMessage(remoteJid, {
                    react: { text: emoji, key: msg.key }
                });
            }
        };

        // Route through the global command registry
        // Requires global.commands to be populated by main.js
        if (!global.commands) return;

        const cmdObj =
            global.commands.get(command) ||
            [...global.commands.values()].find(c => c.aliases?.includes(command));

        if (!cmdObj) return;

        // Owner-only guard
        const ownerJid = `${ctx.ownerNumber}@s.whatsapp.net`;
        if (cmdObj.permissions?.owner && ctx.sender !== ownerJid) {
            return ctx.reply("⛔ Owner only.");
        }

        log.cmd(`[${label}] ${command} from ${ctx.sender}`);
        await cmdObj.code(ctx);

    } catch (err) {
        log.error(`[Session:${label}] Message handler error:`, err.message);
    }
}

// ─── Connect one session ──────────────────────────────────────────
async function connectSession(label, sessPath) {
    const { state, saveCreds } = await useMultiFileAuthState(sessPath);

    const sock = makeWASocket({
        auth             : state,
        printQRInTerminal: false,
        browser          : ["Moonson", "Safari", "3.0"],
        syncFullHistory  : false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            const jid = sock.user?.id || label;
            activeSessions.set(label, { sock, jid });
            log.success(`[Session:${label}] Connected as ${jid}`);
        }
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            activeSessions.delete(label);
            if (code !== DisconnectReason.loggedOut) {
                log.warn(`[Session:${label}] Dropped — reconnecting in 5s...`);
                setTimeout(() => connectSession(label, sessPath), 5000);
            } else {
                log.error(`[Session:${label}] Logged out permanently`);
            }
        }
    });

    // ── Wire message handler ──
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const msg of messages) {
            await handleMessage(sock, label, msg);
        }
    });

    return sock;
}

// ─── Load all sessions on boot ────────────────────────────────────
async function loadAllSessions() {
    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
        log.warn("[SessionManager] sessions/extra/ created — no extra sessions yet");
        return;
    }

    const folders = fs.readdirSync(SESSIONS_DIR)
        .filter(f => fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory());

    if (folders.length === 0) {
        log.warn("[SessionManager] No extra sessions found");
        return;
    }

    log.info(`[SessionManager] Loading ${folders.length} extra session(s)...`);
    for (const folder of folders) {
        await connectSession(folder, path.join(SESSIONS_DIR, folder));
        await new Promise(r => setTimeout(r, 1500));
    }
}

// ─── Register a freshly paired session into the pool ─────────────
// Called by addsession.js after pairing succeeds
function registerSession(label, sock) {
    const jid = sock.user?.id || label;
    activeSessions.set(label, { sock, jid });

    // Wire message handler for live sessions added without restart
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const msg of messages) {
            await handleMessage(sock, label, msg);
        }
    });

    log.success(`[SessionManager] Session ${label} registered live`);
}

function getActiveSessions() {
    return [...activeSessions.values()].map(s => s.sock);
}

function getSessionCount() {
    return activeSessions.size;
}

function getSessionDetails() {
    return [...activeSessions.entries()].map(([label, { sock, jid }]) => ({
        label,
        jid,
        sock
    }));
}

module.exports = {
    loadAllSessions,
    connectSession,
    registerSession,
    getActiveSessions,
    getSessionCount,
    getSessionDetails
};