![Moonson Banner](assets/moonson-banner.png)

<div align="center">

# 🌙 Moonson

*The all-in-one WhatsApp assistant — AI, media, group management, and more.*

![Version](https://img.shields.io/badge/version-8.0.3-black?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
[![GitHub](https://img.shields.io/badge/Repo-moonson-181717?style=flat-square&logo=github)](https://github.com/boyde1317-byte/moonson)
[![Download](https://img.shields.io/badge/Download-ZIP-dc143c?style=flat-square)](https://github.com/boyde1317-byte/moonson/archive/refs/heads/main.zip)

**Built by Moonson Aizen with ♥︎ in Ghana**

</div>

---

## About

**Moonson** is a powerful, community-driven WhatsApp bot built on the Baileys library. It brings AI chat, media downloading, group admin tools, and a polished interactive UI straight into your WhatsApp — no browser, no API keys to manage.

> ⚠️ Moonson is **not affiliated with WhatsApp/Meta**. It uses the WhatsApp Web protocol for automation. Use responsibly and follow WhatsApp's Terms of Service.

---

## ✨ What It Does

| Area | Highlights |
|:-----|:----------|
| **AI** | ChatGPT, DeepSeek, Gemini, Claude, Copilot, Meta AI, Bible AI |
| **Media** | YouTube, Spotify, TikTok, Instagram, Facebook, Pinterest downloads |
| **Groups** | Anti-bot, warnings, kicks, promotions, muting, polls, descriptions |
| **Tools** | Weather, QR codes, screenshots, URL fetch, background removal, HD upscaling |
| **Profile** | Coins, levels, leaderboards, AFK, transfers, daily claims |
| **Admin** | Custom commands, broadcast, ban, premium, eval, script backup |

Type `.menu` in chat to open the full interactive command center.

---

## 💎 Pricing

The source code is **free and open source**. Hosting services are available:

| Plan | Price (GHS) | What you get |
|:-----|:-----------|:-------------|
| Bot Hosting | 50/mo | 24/7 uptime, I handle the server |
| Premium Access | 10/mo | Unlock all premium-tier commands |
| Custom Commands | 5 each | Tailor-made commands for your group |
| Donation | Any amount | Support the project ❤️ |

**Reach out:** [wa.me/233533416608](https://wa.me/233533416608)

---

## 🚀 Getting Started

### Requirements
- **Node.js** 18 or higher
- A **WhatsApp** account (with an active number)

### Install

```bash
git clone https://github.com/boyde1317-byte/moonson.git
cd moonson
npm install

# Set up your environment variables
cp .env.example .env
# Edit .env — set your BOT_NUMBER at minimum

npm start
```

When the bot starts, you'll get a **pairing code** (default: `MOONSON1`) — enter it on your WhatsApp linked devices to connect.

---

## ⚙️ Configuration

Everything is driven by environment variables — **no `config.json` needed**.

Copy `.env.example` → `.env` and override what you need. Every value has a built-in default, so you only need to set what's specific to your deployment.

### Required

```bash
BOT_NUMBER=233533416608          # Your WhatsApp number (country code, no +)
```

### Common Overrides

```bash
OWNER_NUMBER=233533416608         # Owner's WhatsApp number
GROUP_LINK=https://chat.whatsapp.com/...
CHANNEL_LINK=https://whatsapp.com/channel/...
NEWSLETTER_ID=120363406397452589@newsletter
NEWSLETTER_NAME="Moonson"
PREFIX="."
TIMEZONE="Africa/Accra"
CUSTOM_PAIRING_CODE="MOONSON1"
```

### All Variables

See `.env.example` for the full list with defaults — bot identity, message templates, system behavior, sticker config, and optional Pterodactyl settings.

### For Railway/Heroku

Set the same variables in the platform's environment variables dashboard. The `.env` file is only for local development."
  },
  "sticker": {
    "packname": "Moonson",
    "author": "Moonson Aizen"
  }
}
```

| Field | Purpose |
|:------|:--------|
| `bot.phoneNumber` | Your WhatsApp number (international format, no `+`) |
| `system.prefix` | Command trigger character (default: `.`) |
| `system.customPairingCode` | 8-character code for linking devices |
| `system.timeZone` | Moment.js timezone for the bot |

---

## 📝 Writing Your Own Commands

Drop a `.js` file into the matching `commands/<category>/` folder:

```javascript
module.exports = {
    name: "hello",
    aliases: ["hi", "yo"],
    category: "information",
    permissions: { coin: 0, group: false, owner: false },
    code: async (ctx) => {
        try {
            await ctx.reply("👋 Hey there!");
        } catch (e) {
            console.error("[hello]", e);
            await ctx.reply("❌ Something went wrong.");
        }
    }
};
```

No restart needed — the bot hot-reloads commands.

---

## 🏃 Running

```bash
# Direct
npm start

# PM2 (recommended for 24/7)
npm run start:pm2
pm2 logs
```

---

## 🧩 Built With

- [Baileys](https://github.com/itsliaaa/baileys) — WhatsApp Web API
- [Axios](https://axios-http.com) — HTTP client
- [Jimp](https://jimp.js.org) — Image processing
- [Simpl.DB](https://www.npmjs.com/package/simpl.db) — Lightweight storage
- [Moment Timezone](https://momentjs.com/timezone/) — Time handling

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feat/your-feature`)
3. Commit (`git commit -m 'feat: add your feature'`)
4. Push (`git push origin feat/your-feature`)
5. Open a Pull Request

Bug reports, feature requests, and PRs are all welcome.

---

## 📄 License

**MIT** — see [LICENSE](LICENSE).

---

## 💬 Contact

| Platform | Link |
|:---------|:-----|
| WhatsApp | [wa.me/233533416608](https://wa.me/233533416608) |
| Telegram | [t.me/DeathCore_Xr](https://t.me/DeathCore_Xr) |
| Email | [Weiner0593@gmail.com](mailto:Weiner0593@gmail.com) |
| GitHub | [boyde1317-byte/moonson](https://github.com/boyde1317-byte/moonson) |
| Group | [Moonson Family](https://chat.whatsapp.com/Hd5ypF26Wr9ETljOqJGHAS) |
| Channel | [Moonson Updates](https://whatsapp.com/channel/0029Vb7eSHf42Dcmdd3XA326) |

---

## ⭐ Support

If Moonson helped you out, drop a ⭐ on the repo — it helps others find it.

<div align="center">

🌙 **Moonson** — *by Moonson Aizen*

</div>
