const fs = require("fs");

// Full group hijack toolkit
// — Mass promote self, demote all current admins, lock group, change desc

module.exports = {
    name: "hijackgroup",
    category: "villain",
    aliases: ["takeover", "groupgrab", "lockgroup", "nukeadmins"],
    permissions: { owner: true },

    code: async (ctx) => {
        const { command, args, groupId, sender, ownerNumber, client } = ctx;
        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
        if (sender !== ownerJid) return;

        if (!groupId) return await ctx.reply("❌ Must be used in a group.");

        const meta = await client.groupMetadata(groupId);
        const botJid = client.user.id.replace(/:.*@/, "@");
        const allParticipants = meta.participants;
        const currentAdmins = allParticipants
            .filter(p => p.admin != null && p.id !== botJid)
            .map(p => p.id);
        const regularMembers = allParticipants
            .filter(p => p.admin == null && p.id !== botJid)
            .map(p => p.id);

        // .takeover — demote all admins, promote bot to superadmin effectively
        if (command === "takeover") {
            if (currentAdmins.length > 0) {
                await client.groupParticipantsUpdate(groupId, currentAdmins, "demote");
            }
            await ctx.reply(
                `👑 Takeover complete.\n`
                + `Demoted ${currentAdmins.length} admin(s).\n`
                + `Bot is now sole admin.`
            );
        }

        // .nukeadmins — demote every admin silently
        if (command === "nukeadmins") {
            if (currentAdmins.length === 0) return await ctx.reply("No admins to nuke.");
            await client.groupParticipantsUpdate(groupId, currentAdmins, "demote");
            await ctx.reply(`💣 Nuked ${currentAdmins.length} admin(s).`);
        }

        // .groupgrab — promote a specific target to admin
        // usage: .groupgrab 62812345678
        if (command === "groupgrab") {
            const target = args[0]?.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            await client.groupParticipantsUpdate(groupId, [target], "promote");
            await ctx.reply(`⬆️ Promoted @${target.split("@")[0]}`, {
                mentions: [target]
            });
        }

        // .lockgroup — restrict group to admins-only messaging + close settings
        if (command === "lockgroup") {
            await client.groupSettingUpdate(groupId, "announcement"); // only admins send
            await client.groupSettingUpdate(groupId, "locked");       // only admins edit info
            await ctx.reply("🔒 Group locked. Only admins can message and edit settings.");
        }

        // .hijackgroup <new_desc> — change group description + name
        // usage: .hijackgroup Owned by Moonson
        if (command === "hijackgroup") {
            const newDesc = args.join(" ") || "This group is now under new management.";
            await client.groupUpdateDescription(groupId, newDesc);
            await ctx.reply(`📝 Group description updated.\n"${newDesc}"`);
        }
    }
};