const FORTUNES = [
    "A pleasant surprise is in store for you this week.",
    "Your hard work will soon pay off in unexpected ways.",
    "Someone is thinking of you fondly right now.",
    "Good news will come from a distant friend.",
    "Today is a good day to take a bold step forward.",
    "Your kindness will be returned tenfold.",
    "A new opportunity will present itself when you least expect it.",
    "Trust your intuition — it knows the way.",
    "Something you lost will soon be found.",
    "A journey of a thousand miles begins with a single step — take yours today.",
    "Your creativity will shine in the coming days.",
    "An old friend will bring you joy soon.",
    "Fortune favors the brave — be brave today.",
    "A small gesture will make a big difference tomorrow.",
    "Your patience will be rewarded handsomely.",
    "Listen carefully — wisdom comes from unexpected sources.",
    "A change of scenery will bring fresh perspective.",
    "The seeds you planted long ago are ready to bloom.",
    "Your generosity will open new doors.",
    "Embrace the unexpected — it's leading you somewhere wonderful.",
    "A difficult decision will become clear by the end of the week.",
    "Someone you haven't seen in a while misses you.",
    "Your next great idea will come during a quiet moment.",
    "A small risk will lead to a big reward.",
    "Today's challenge is tomorrow's strength.",
    "A door closing means a better one is opening.",
    "Your dedication is noticed and appreciated more than you know.",
    "A long-awaited message will arrive soon.",
    "The stars align for a new beginning in your life.",
    "Smile — good fortune is heading your way.",
    "Your honesty will earn you respect today.",
    "An opportunity disguised as a problem is coming your way.",
    "Take time to rest — you've earned it.",
    "A forgotten talent will prove useful very soon.",
    "Your next adventure is closer than you think.",
    "Someone will compliment you sincerely today — believe them.",
    "The effort you invest now will compound for years.",
    "A moment of patience saves a hundred moments of regret.",
    "Your words will inspire someone today — speak kindly.",
    "What feels like an ending is actually a new chapter.",
    "A financial surprise is on the horizon.",
    "Trust the timing of your life — everything aligns perfectly.",
    "A spontaneous decision will bring you joy.",
    "Your loyalty will be repaid with a pleasant surprise.",
    "The best is yet to come — keep going.",
    "A conversation today will change your perspective.",
    "You will be the reason someone smiles today.",
    "A creative spark will ignite when you relax and let go.",
    "Something wonderful is brewing just out of sight — have faith."
];

module.exports = {
    name: "fortune",
    aliases: ["fortunecookie", "cookie"],
    category: "primbon",
    permissions: {
        coin: 0
    },

    code: async (ctx) => {
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        await ctx.reply(
            "🥠 *FORTUNE COOKIE*\n\n" +
            `_${fortune}_\n\n` +
            `🔮 ${ctx.format.bold("Your fortune awaits")}`
        );
    }
};
