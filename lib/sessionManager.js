const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    isPnUser,
    isLidUser,
    delay
} = require("baileys");
const { Commands } = require("./handler");
const fs   = require("node:fs");
const path = require("node:path");

const SESSIONS_DIR   = path.join(process.cwd(), "sessions", "extra");
const activeSessions = new Map();

// ─── Message handler — mirrors Client._setupEvent ────────────────
async function handleMessage(sock, label, message) {
    try {
        if (!message.message) return;
        if (message.key.remoteJid === "status@broadcast") return;

        const primary = global.moonsonClient;
        if (!primary) return; // primary bot not ready yet

        // Mirror primary bot's JID resolution
        const senderJids = [
            message.key.participant,
            message.key.participantAlt,
            message.key.remoteJid,
            message.key.remoteJidAlt
        ].filter(Boolean).map(jid => jidNormalizedUser(jid));

        const senderJid = message.key.fromMe
            ? jidNormalizedUser(sock.user?.id)
            : senderJids.find(jid => isPnUser(jid));

        const senderLid = message.key.fromMe
            ? jidNormalizedUser(sock.user?.lid)
            : senderJids.find(jid => isLidUser(jid));

        if (!senderJid || !senderLid || !message.pushName) return;

        // Update pushName via primary bot's db
        primary._updatePushName(senderLid, message.pushName);

        const { getBodyFromMsg } = require("./helper");
        const body = getBodyFromMsg(message);

        // Build a Commands-compatible context
        // Commands() expects the full Client spread + m + sender
        await Commands({
            ...primary,            // spreads cmd, db, prefix, owner, middlewares etc
            core: sock,            // override core socket to THIS session's socket
            sendMessage: async (jid, content, options = {}) => {
                return await primary._createSendMessage.call(
                    { ...primary, core: sock },
                    jid, content, options
                );
            },
            m: {
                ...message,
                body
            },
            sender: {
                jid: senderJid,
                lid: senderLid,
                pushName: message.pushName
            }
        }, primary._runMiddlewares.bind(primary));

    } catch (err) {
        log.error(`[Session:${label}] Handler error: ${err.message}`);
    }
}

// ─── Connect one session ──────────────────────────────────────────
async function connectSession(label, sessPath) {
    const { state, saveCreds } = await useMultiFileAuthState(sessPath);

    const sock = makeWASocket({
        auth             : state,
        printQRInTerminal: false,
        browser          : require("baileys").Browsers.macOS("Safari"),
        syncFullHistory  : false,
        logger           : require("pino")({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            activeSessions.set(label, { sock, jid: sock.user?.id });
            log.success(`[Session:${label}] Connected as ${sock.user?.id}`);
        }
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            activeSessions.delete(label);
            if (code !== DisconnectReason.loggedOut) {
                log.warn(`[Session:${label}] Dropped — reconnecting in 5s`);
                setTimeout(() => connectSession(label, sessPath), 5000);
            } else {
                log.error(`[Session:${label}] Logged out permanently`);
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const message of messages) {
            await handleMessage(sock, label, message);
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

// ─── Register freshly paired session (from addsession.js) ────────
function registerSession(label, sock) {
    activeSessions.set(label, { sock, jid: sock.user?.id });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const message of messages) {
            await handleMessage(sock, label, message);
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
        label, jid, sock
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