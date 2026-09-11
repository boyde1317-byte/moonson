const Baileys = require("baileys");

const resolveTargetPnJid = async (ctx) => {
    const candidates = [];

    const mentioned = await ctx.getMentioned();
    if (mentioned[0]) candidates.push(mentioned[0]);

    if (ctx.quoted?.sender) candidates.push(ctx.quoted.sender);

    const numArg = ctx.args[0]?.replace(/[^\d]/g, "");
    if (numArg) candidates.push(numArg + Baileys.S_WHATSAPP_NET);

    return candidates.find(jid => Baileys.isPnUser(jid)) || null;
};

module.exports = [{
    name: "addowner",
    aliases: ["addown", "ao"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        const targetJid = await resolveTargetPnJid(ctx);

        if (!targetJid)
            return await ctx.reply({
                text: `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "@6281234567891")}\n` +
                    `${ctx.format.generateNotes([
                        "Reply/quote a message to make the sender the target."
                    ])}`
            });

        if (ctx.bot.owner.some(o => Baileys.areJidsSameUser(o + Baileys.S_WHATSAPP_NET, targetJid)))
            return await ctx.reply(ctx.format.info("That user is already an owner!"));

        try {
            const targetId = ctx.getId(targetJid);

            ctx.bot.owner.push(targetId);

            const botDb = ctx.db.bot;
            botDb.extraOwners = [...(botDb?.extraOwners || []), targetId];
            botDb.save();

            if (!config.system.restrict) {
                await ctx.sendMessage(targetJid, ctx.format.info("You have been added as an owner of this bot!"));
            }

            await ctx.reply({
                text: ctx.format.info(`Successfully added @${targetId} as an owner!`),
                mentions: [targetJid]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
}, {
    name: "delowner",
    aliases: ["delown", "removeowner"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        const targetJid = await resolveTargetPnJid(ctx);

        if (!targetJid)
            return await ctx.reply({
                text: `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                    `${ctx.format.generateCmdExample(ctx.used, "@6281234567891")}\n` +
                    `${ctx.format.generateNotes([
                        "Reply/quote a message to make the sender the target."
                    ])}`
            });

        if (config.owner.id && Baileys.areJidsSameUser(config.owner.id + Baileys.S_WHATSAPP_NET, targetJid))
            return await ctx.reply(ctx.format.info("The primary owner (OWNER_NUMBER config) can't be removed this way!"));

        const botDb = ctx.db.bot;
        const extraOwners = botDb?.extraOwners || [];

        if (!extraOwners.some(id => Baileys.areJidsSameUser(id + Baileys.S_WHATSAPP_NET, targetJid)))
            return await ctx.reply(ctx.format.info("That user is not a shared owner (added via .addowner)!"));

        try {
            const targetId = ctx.getId(targetJid);

            const ownerIndex = ctx.bot.owner.findIndex(o => Baileys.areJidsSameUser(o + Baileys.S_WHATSAPP_NET, targetJid));
            if (ownerIndex !== -1) ctx.bot.owner.splice(ownerIndex, 1);

            botDb.extraOwners = extraOwners.filter(id => !Baileys.areJidsSameUser(id + Baileys.S_WHATSAPP_NET, targetJid));
            botDb.save();

            await ctx.reply({
                text: ctx.format.info(`Successfully removed @${targetId} from owners!`),
                mentions: [targetJid]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error);
        }
    }
}];
