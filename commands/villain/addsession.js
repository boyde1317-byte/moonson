const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("baileys");
const fs   = require("node:fs");
const path = require("node:path");

const SESSIONS_DIR = path.join(process.cwd(), "sessions", "extra");
const pendingPairs = new Map();

async function spawnSession(label, onPairingCode, onSuccess, onFail) {
    const sessPath = path.join(SESSIONS_DIR, label);
    fs.mkdirSync(sessPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessPath);

    const sock = makeWASocket({
        auth             : state,
        printQRInTerminal: false,
        browser          : require("baileys").Browsers.macOS("Safari"),
        syncFullHistory  : false,
        logger           : require("pino")({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    try {
        await new Promise(r => setTimeout(r, 2000));
        const code = await sock.requestPairingCode(label.replace(/\D/g, ""));
        const formatted = code.match(/.{1,4}/g)?.join("-") || code;
        onPairingCode(formatted);
    } catch (err) {
        onFail(`Failed to get pairing code: ${err.message}`);
        return;
    }

    const timeout = setTimeout(() => {
        if (pendingPairs.has(label)) {
            try { sock.end(); } catch {}
            fs.rmSync(path.join(SESSIONS_DIR, label), { recursive: true, force: true });
            pendingPairs.delete(label);
            onFail(`Pairing timed out for ${label} — session removed.`);
        }
    }, 3 * 60 * 1000);

    pendingPairs.set(label, { sock, timeout });

    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            const { registerSession } = require("../../lib/sessionManager");
            clearTimeout(pendingPairs.get(label)?.timeout);
            registerSession(label, sock);
            pendingPairs.delete(label);
            onSuccess(label);
        }
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code === DisconnectReason.loggedOut) {
                fs.rmSync(path.join(SESSIONS_DIR, label), { recursive: true, force: true });
                pendingPairs.delete(label);
                onFail(`Session ${label} logged out before pairing completed.`);
            }
        }
    });
}

module.exports = {
    name: "addsession",
    category: "villain",
    aliases: ["newsession", "linksession", "removesession", "listsessions"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { command, args, sender, ownerNumber } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;

        // ── .listsessions ──────────────────────────────────────────
        if (command === "listsessions") {
            const active  = global.getSessionCount?.() ?? 0;
            const pending = pendingPairs.size;

            if (!fs.existsSync(SESSIONS_DIR)) {
                return ctx.reply("📭 No extra sessions registered yet.");
            }

            const folders = fs.readdirSync(SESSIONS_DIR)
                .filter(f => fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory());

            if (folders.length === 0) {
                return ctx.reply("📭 No extra sessions registered yet.");
            }

            const list = folders.map((f, i) => {
                const status = pendingPairs.has(f) ? "⏳ pending" : "✅ active";
                return `${i + 1}. ${f} — ${status}`;
            }).join("\n");

            return ctx.reply(
                `📋 *Extra Sessions*\n\n`
                + list + "\n\n"
                + `Active : ${active}\n`
                + `Pending: ${pending}`
            );
        }

        // ── .removesession <label> ─────────────────────────────────
        if (command === "removesession") {
            const label = args[0];
            if (!label) return ctx.reply("Usage: .removesession <label>");

            const sessPath = path.join(SESSIONS_DIR, label);
            if (!fs.existsSync(sessPath)) {
                return ctx.reply(`❌ No session found: ${label}`);
            }

            if (pendingPairs.has(label)) {
                const { sock, timeout } = pendingPairs.get(label);
                clearTimeout(timeout);
                try { sock.end(); } catch {}
                pendingPairs.delete(label);
            }

            fs.rmSync(sessPath, { recursive: true, force: true });
            return ctx.reply(`🗑️ Session *${label}* removed.\nRestart to fully deregister from pool.`);
        }

        // ── .addsession <number> ───────────────────────────────────
        const num = args[0]?.replace(/\D/g, "");
        if (!num || num.length < 7 || num.length > 15) {
            return ctx.reply(
                `*Add Session — Usage*\n\n`
                + `.addsession <number>\n`
                + `.listsessions\n`
                + `.removesession <label>\n\n`
                + `Example: .addsession 62812345678`
            );
        }

        const sessPath = path.join(SESSIONS_DIR, num);
        if (fs.existsSync(sessPath)) {
            return ctx.reply(
                `⚠️ Session for ${num} already exists.\n`
                + `Use .removesession ${num} to re-pair.`
            );
        }

        if (pendingPairs.has(num)) {
            return ctx.reply(`⏳ Already pairing ${num}.`);
        }

        await ctx.reply(
            `🔗 *Pairing New Session*\n\n`
            + `Number: ${num}\n`
            + `Generating pairing code...`
        );

        await spawnSession(
            num,
            async (code) => {
                await ctx.reply(
                    `📲 *Pairing Code for ${num}*\n\n`
                    + `\`\`\`${code}\`\`\`\n\n`
                    + `WhatsApp → Linked Devices → Link with phone number\n`
                    + `⏳ Expires in 3 minutes.`
                );
            },
            async (label) => {
                await ctx.reply(
                    `✅ *Session ${label} Connected*\n\n`
                    + `Live in reporter pool immediately.`
                );
            },
            async (reason) => {
                await ctx.reply(`❌ *Session Failed*\n\n${reason}`);
            }
        );
    }
};