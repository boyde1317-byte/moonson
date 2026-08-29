/**
 * ── Moonson Configuration ──
 * All config is driven by environment variables (.env or Railway/Heroku vars).
 * No config.json needed. Every value has a sensible default below.
 *
 * Copy .env.example → .env and override what you need.
 */

// ── Helpers ──
const bool = (val, fallback) => (val === undefined ? fallback : val === "true" || val === "1");
const num = (val, fallback) => (val === undefined ? fallback : Number(val) || fallback);

const config = {
  // ── Bot identity ──
  bot: {
    name:          process.env.BOT_NAME       || "Moonson",
    botNumber:     process.env.BOT_NUMBER     || "0500008091",
    phoneNumber:   process.env.BOT_NUMBER     || "0500008091",
    thumbnail:     process.env.BOT_THUMBNAIL  || "https://media.base44.com/images/public/6a6faa067c8ee05c592007b5/a174ce51a_generated_image.png",
    groupJid:      process.env.GROUP_JID       || "",
    groupLink:     process.env.GROUP_LINK      || "https://chat.whatsapp.com/Hd5ypF26Wr9ETljOqJGHAS?s=cl&p=a&ilr=0",
    channellink:   process.env.CHANNEL_LINK   || "https://whatsapp.com/channel/0029Vb7eSHf42Dcmdd3XA326",
    telegram:      process.env.TELEGRAM_LINK   || "https://t.me/DeathCore_Xr",
  },

  // ── Message templates (safe defaults, override via env if you want) ──
  msg: {
    admin:              process.env.MSG_ADMIN              || "This command can only be used by group admins!",
    banned:             process.env.MSG_BANNED             || "You have been banned!",
    botAdmin:           process.env.MSG_BOT_ADMIN           || "The bot must be a group admin!",
    botGroupMembership:  process.env.MSG_BOT_GROUP_MEMBERSHIP  || "You have not joined the bot's group!",
    coin:               process.env.MSG_COIN               || "You don't have enough coins!",
    cooldown:           process.env.MSG_COOLDOWN            || "This command is on cooldown, please wait...",
    gamerestrict:       process.env.MSG_GAMERESTRICT        || "The group admin has restricted game commands!",
    group:              process.env.MSG_GROUP               || "This command can only be used in groups!",
    groupSewa:          process.env.MSG_GROUP_SEWA          || "The group admin has not purchased a rental!",
    owner:              process.env.MSG_OWNER               || "This command can only be used by the owner!",
    premium:            process.env.MSG_PREMIUM             || "You must be a premium user!",
    private:            process.env.MSG_PRIVATE             || "This command can only be used in private chats!",
    privatePremiumOnly: process.env.MSG_PRIVATE_PREMIUM_ONLY || "You must be a premium user to use this in private chats.",
    restrict:           process.env.MSG_RESTRICT            || "This command is restricted to prevent WhatsApp bans!",
    unavailableAtNight: process.env.MSG_UNAVAILABLE_AT_NIGHT || "The bot is unavailable from 12:00 AM to 6:00 AM! Please come back later.",
    footer:             process.env.MSG_FOOTER              || "© Moonson by Moonson Aizen with ♥︎",
    wait:               process.env.MSG_WAIT                || "Please wait...",
    notFound:           process.env.MSG_NOT_FOUND           || "Nothing found! Try again later.",
    error:             process.env.MSG_ERROR               || "An error occurred while processing your request! Please try again later or contact the owner if the problem persists.",
    invalidUrl:        process.env.MSG_INVALID_URL         || "Invalid URL!",
  },

  // ── Owner ──
  owner: {
    name:          process.env.OWNER_NAME         || "Moonson Aizen",
    organization:   process.env.OWNER_ORG          || "Moonson",
    id:            process.env.OWNER_NUMBER       || process.env.BOT_NUMBER || "",
    report:        bool(process.env.OWNER_REPORT, true),
    co: [],
  },

  // ── Sticker ──
  sticker: {
    packname: process.env.STICKER_PACKNAME || "Moonson",
    author:   process.env.STICKER_AUTHOR   || "Moonson Aizen",
  },

  // ── System behavior ──
  system: {
    alwaysOnline:            bool(process.env.ALWAYS_ONLINE,           true),
    antiCall:                bool(process.env.ANTI_CALL,               true),
    autoRead:                bool(process.env.AUTO_READ,              true),
    autoTypingOnCmd:         bool(process.env.AUTO_TYPING_ON_CMD,     true),
    cooldown:                num(process.env.COOLDOWN,                 10000),
    maxListeners:            num(process.env.MAX_LISTENERS,             50),
    port:                    num(process.env.PORT,                     3000),
    privatePremiumOnly:      bool(process.env.PRIVATE_PREMIUM_ONLY,    true),
    restrict:                bool(process.env.RESTRICT,                false),
    requireBotGroupMembership: bool(process.env.REQUIRE_BOT_GROUP_MEMBERSHIP, false),
    requireGroupSewa:        bool(process.env.REQUIRE_GROUP_SEWA,      false),
    selfReply:               bool(process.env.SELF_REPLY,              true),
    timeZone:                process.env.TIMEZONE                     || "Africa/Accra",
    unavailableAtNight:      bool(process.env.UNAVAILABLE_AT_NIGHT,   false),
    useCoin:                 bool(process.env.USE_COIN,                true),
    usePairingCode:          bool(process.env.USE_PAIRING_CODE,         true),
    customPairingCode:       process.env.CUSTOM_PAIRING_CODE          || "MOONSON1",
    useStore:                bool(process.env.USE_STORE,               false),
    useServer:               bool(process.env.USE_SERVER,              false),
    prefix:                  process.env.PREFIX                       || ".",
  },

  // ── Pterodactyl (optional — only if you sell servers) ──
  pterodactyl: {
    panelUrl:        process.env.PTERO_PANEL_URL   || null,
    apiKey:          process.env.PTERO_API_KEY     || null,
    defaultEgg:       num(process.env.PTERO_DEFAULT_EGG,       1),
    defaultLocation: num(process.env.PTERO_DEFAULT_LOCATION,  1),
    defaultNest:     num(process.env.PTERO_DEFAULT_NEST,      5),
  },

  // ── Newsletter / Annotations ──
  newsletter: {
    id:   process.env.NEWSLETTER_ID   || "",
    name: process.env.NEWSLETTER_NAME  || "",
  },
};

module.exports = config;
