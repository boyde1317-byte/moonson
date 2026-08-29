module.exports = {
    name: "brand",
    aliases: ["about", "info", "moonson", "aizen"],
    category: "information",
    permissions: { coin: 0 },
    code: async (ctx) => {
        try {
            const ownerNumber = config?.owner?.id || "233533416608";
            const phoneFormatted = ownerNumber.replace(/[^0-9]/g, '');
            const groupLink = config?.bot?.groupLink || "https://chat.whatsapp.com/EWlNm6bMYJCELwzvnmboyC";
            const channelLink = config?.bot?.channellink || "https://whatsapp.com/channel/0029Vb7eSHf42Dcmdd3XA326";
            const websiteLink = config?.bot?.website || "https://infomoonson.vercel.app";
            const footer = config?.msg?.footer || `© ${config?.bot?.name || "Moonson"}`;

            const bookingDescription =
                `» *Moonson*\n` +
                `  › Built with ♥︎ in Ghana\n\n` +
                `» *Who We Are*\n` +
                `  › Ghanaian technology brand\n` +
                `  › AI-powered bots & automation\n` +
                `  › Server hosting solutions\n\n` +
                `» *What We Do*\n` +
                `  › WhatsApp & Telegram Bots\n` +
                `  › Server Hosting (1GB – Unlimited)\n` +
                `  › Pterodactyl Panel Management\n` +
                `  › Website Development\n` +
                `  › Automation & Digital Solutions\n\n` +
                `» *Our Products*\n` +
                `  › Moonson – WhatsApp Bot\n` +
                `  › Moonson – Telegram Bot\n` +
                `  › AizenWeb – Website\n` +
                `  › AizenPanel – Pterodactyl Management\n\n` +
                `» *Our Team*\n` +
                `  › Moonson Aizen – Founder & Developer\n\n` +
                `» *Mission*\n` +
                `  › Making technology accessible,\n` +
                `  › affordable, and useful for everyone.\n\n` +
                `» *Values*\n` +
                `  › Innovation · Simplicity · Reliability\n` +
                `  › Community-Driven\n\n` +
                `» *Connect With Us*\n` +
                `  › WhatsApp: wa.me/${phoneFormatted}\n` +
                `  › Email: Weiner0593@gmail.com\n` +
                `  › Group: Moonson Family\n` +
                `  › Channel: Moonson Updates\n` +
                `  › Website: ${websiteLink}\n\n` +
                `_Built with ♥︎ by Moonson Aizen_`;

            const outerBody =
                `» *Moonson*\n` +
                `  › Built with ♥︎ in Ghana\n\n` +
                `» *Your Tech Hub*\n` +
                `  › AI Bots · Server Hosting · Automation\n\n` +
                `_Tap the button below for full details._`;

            await ctx.core.relayMessage(ctx._msg.key.remoteJid, {
                messageContextInfo: {
                    threadId: [],
                    deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [] },
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: {
                    header: {
                        title: "🖥️ Moonson",
                        hasMediaAttachment: false
                    },
                    body: {
                        text: outerBody
                    },
                    footer: { text: footer },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "booking_confirmation",
                            buttonParamsJson: JSON.stringify({
                                start_datetime: new Date().toISOString(),
                                end_datetime: new Date(Date.now() + 600000).toISOString(),
                                location: "Moonson",
                                booking_url: websiteLink,
                                phone_number: phoneFormatted,
                                booking_management_url: `https://wa.me/${phoneFormatted}`,
                                description: bookingDescription,
                                email: "Weiner0593@gmail.com",
                                display_text: "📊 View Brand Details",
                                display_content: {
                                    display_language: "en",
                                    display_meeting_type: "Brand Information",
                                    display_bottom_sheet_header: "📋 Moonson",
                                    display_add_to_calendar_cta_text: "BRAND",
                                    display_view_on_maps_cta_text: "View Website",
                                    display_manage_booking_cta_text: "📱 Contact",
                                    display_manage_booking_not_supported_text: "Brand Info",
                                    display_read_more: "View Details"
                                }
                            })
                        }],
                        messageParamsJson: "{}"
                    },
                    contextInfo: {
                        mentionedJid: [],
                        groupMentions: [],
                        statusAttributions: [],
                        stanzaId: "StatusBiz",
                        participant: "0@s.whatsapp.net",
                        quotedMessage: {
                            contactMessage: {
                                displayName: config?.bot?.name || "Moonson",
                                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${config?.bot?.name || "Moonson"} Bot\nFN:${config?.bot?.name || "Moonson"} Bot\nORG:${config?.bot?.name || "Moonson"};\nTEL;type=CELL;type=VOICE;waid=${phoneFormatted}:${phoneFormatted}\nEND:VCARD`
                            }
                        },
                        remoteJid: "status@broadcast"
                    }
                }
            }, {
                additionalNodes: [{
                    tag: "biz",
                    attrs: {},
                    content: [{
                        tag: "interactive",
                        attrs: { type: "native_flow", v: "1" },
                        content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }]
                    }]
                }]
            });

        } catch (error) {
            console.error("[brand] Error:", error);
            await ctx.reply("❌ Failed to load brand information.");
        }
    }
};