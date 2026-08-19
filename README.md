![Moonson Banner](assets/moonson-banner.png)

# Moonson
**WhatsApp Bot**

![Version](https://img.shields.io/badge/version-8.0.3-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
[![Release](https://img.shields.io/badge/Release-latest-blue)](https://github.com/boyde1317-byte/moonson/releases)
[![Fork](https://img.shields.io/badge/Fork-Repo-orange)](https://github.com/boyde1317-byte/moonson/fork)
[![Download ZIP](https://img.shields.io/badge/Download-ZIP-red)](https://github.com/boyde1317-byte/moonson/archive/refs/heads/main.zip)

**Advanced WhatsApp Bot with AI, Downloaders, and Group Management**

---

## 📌 Table of Contents
- [Is this bot official?](##-📌-Is-this-bot-official?)
- [Pricing](##💰Pricing)
- [Features](##-✨-Features)
- [Commands](##-📋-Commands)
- [Installation](##-🚀-Installation)
- [Configuration](##-⚙️-Configuration)
- [Creatingcustomcmd](##-📝-Creating-Custom-Commands)
- [Usage](##-🏃-Usage)
- [Screenshots](##-🖼️-Screenshots)
- [Contributing](##-👥-Contributors)
- [Contributors](##-👥-Contributors)
- [License](##-📄-License)
- [Support / Contact](##-💬-Support-/-Contact)
- [show support](##-⭐-Show-your-support)
- [join our site for updates](##-🌠-SITE-FOR-UPDATES)

---
## 📌 Is this bot official?

**Yes and no.**  
This bot is developed and maintained by **Moonson** – it is **officially supported** by the author, but it is **not an official WhatsApp product**. It is a community project that uses the WhatsApp Web protocol (via Baileys) to provide an automated assistant. **Use it responsibly** and comply with WhatsApp’s Terms of Service.

> 💡 **Advice from the author:**  
> Always keep your bot updated, avoid spamming, and respect group admins. This bot is free and open‑source – if you like it, consider ⭐ starring the repo and sharing it with friends!,for updates [join our site for updates](## 🌠 SITE FOR UPDATES)

---

## 💰Pricing

The source code is **free** and open source. However, if you want me to host and maintain the bot for you:

| Service | Price (TZS) | Description |
| :--- | :--- | :--- |
| Bot Hosting (Monthly) | 5,000 | I host the bot 24/7 for you |
| Premium Access (Monthly) | 1,000 | Unlock all premium features |
| Custom Commands | 500 | I add custom commands for your group |
| Donation | Any amount | Support the project ❤️ |

**Contact:** [owner](https://wa.me//233533416608)

---

## ✨ Features

- 🤖 **AI Chat** – ChatGPT, DeepSeek, Gemini, Claude, Meta AI
- 🎵 **Downloaders** – YouTube, Spotify, Facebook, TikTok, Instagram
- 👥 **Group Management** – Anti-bot, Warn, Kick, Promote, Demote, Mute
- 🎨 **Rich UI** – AIRich messages, interactive buttons, booking cards
- 📊 **User Status** – Level, coins, badges, uptime tracking
- 🔧 **Custom Commands** – Add/edit commands on-the-fly with `.addcmd`

---

## 📋 Commands

| Category | Commands |
|----------|----------|
| **AI Chat** | `.chatgpt`, `.deepseek`, `.gemini`, `.claude`, `.meta`, `.unlimitedai`, `.publicai` |
| **Downloader** | `.play`, `.facebookdl`, `.ytmp3`, `.ytmp4`, `.tiktokdl`, `.instagramdl` |
| **Group** | `.antibot`, `.warn`, `.kick`, `.promote`, `.demote`, `.mute`, `.setoption` |
| **Information** | `.about`, `.status`, `.uptime`, `.owner`, `.bizinfo` |
| **Owner** | `.addcmd`, `.reload`, `.setprefix`, `.run` |
| **Tools** | `.banana`, `.table`, `.weather`, `.poll` |

> Use `.menu` to open the interactive main menu.

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- A **WhatsApp** account

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Moonson.git
cd Moonson

# 2. Install dependencies
npm install

# 3. Copy and configure the example config
cp config.example.json config.json
```
---

## ⚙️ Configuration

Edit `config.example.json` with your details:
rename `config.example.json` to `config.json`

```json
{
  "bot": {
    "name": "Moonson",
    "phoneNumber": "233533416608",
    "thumbnail": "https://files.catbox.moe/yryprc.jpg",
    "groupjid" : ""
    "groupLink": "https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC"
    "channellink": "https://whatsapp.com/channel/0029VbDJJY19WtC1T0Vgqp0v"
  },
  "system": {
    "prefix": ".",
    "usePairingCode": true,
    "customPairingCode": "MOONSON1",
    "timeZone": "Africa/Ghana"
  },
  "owner": {
    "name": "Moonson",
    "id": "233533416608"
  }
}
```

| Key | Description |
|-----|-------------|
| `bot.phoneNumber` | Your WhatsApp number (international format) |
| `system.prefix` | Command prefix (default: `.`) |
| `system.usePairingCode` | Use pairing code instead of QR scan |

---

## 📝 Creating Custom Commands

Anyone can add new commands to the bot. Use the template below to create your own command.

### 📋 Command Template

```javascript
module.exports = {
    name: "yourcommand",        // Main command name (required)
    aliases: ["yc", "cmd"],     // Alternative names (optional)
    category: "yourcategory",   // Folder name (optional)
    permissions: {              // Permission flags (optional)
        coin: 0,                // Cost in coins
        group: false,           // Only in groups?
        owner: false,           // Only bot owner?
        premium: false,         // Only premium users?
        admin: false,           // Only group admins?
        botAdmin: false,        // Bot must be admin?
        private: false,         // Only private chats?
        restrict: false         // Restrictive mode?
    },
    code: async (ctx) => {      // Main function (required)
        try {
            // ── Your logic here ──
            await ctx.reply("✅ Command executed!");
        } catch (error) {
            console.error("[yourcommand] Error:", error);
            await ctx.reply("❌ An error occurred.");
        }
    }
};
```
---

## 🏃 Usage

### Start the Bot

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### With PM2

```bash
npm run start:pm2
pm2 logs
```

Once running, scan the QR code or use the pairing code to connect your WhatsApp account.

---

## 🖼️ Screenshots

![Moonson Banner](assets/moonson-banner.png)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
   
Contributions, issues, and feature requests are welcome!
Feel free to check the issues page or open a pull request.


---

## 👥 Contributors

| Name | Role |
|------|------|
| **Moonson** | Founder & Lead Developer |
| **Moonson** | Contributor |
| **Moonson** | Contributor |


---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 💬 Support / Contact

| Name | Contact |
|------|---------|
| **[Moonson](https://wa.me/233533416608)** | WhatsApp |
| **[Moonson](https://wa.me/233533416608)** | WhatsApp |
| **[Moonson](https://wa.me/233533416608)** | WhatsApp |
| **[Moonson family](https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC)** | WhatsApp Group |
| **[Moonson](mailto:aizen.moonson@gmail.com)** | Email |
|**[Moonson updates](https://whatsapp.com/channel/0029VbDJJY19WtC1T0Vgqp0v)** |WhatsApp channel 
---
## ⭐ Show your support

If you like this project, please give it a ⭐ on GitHub – it helps others discover it!

---

## 🌠 SITE FOR UPDATES

### 📢 **Moonson Family Group**

> Welcome to the **Moonson Family Group**! 🚀 This is the official WhatsApp group for users, developers, and enthusiasts of the Moonson brand. Share your experiences, ask questions, report bugs, suggest new features, and connect with the team and other users.

**[Join Group](https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC)**

---

### 📢 **Moonson Updates Channel**

> 📢 The official broadcast channel for **Moonson**. Get the latest news, updates, new features, release notes, and important announcements. Stay informed and never miss an update!

**[Join WhatsApp Channel](https://whatsapp.com/channel/0029VbDJJY19WtC1T0Vgqp0v)**

built by Moonson Aizen with ♥︎
