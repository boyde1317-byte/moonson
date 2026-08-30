const FIGLET = (() => {
    try { return require("figlet"); } catch { return null; }
})();

// Built-in ASCII font for when figlet isn't installed
const ASCII_FONTS = {
    standard: {
        A: ["  AAA  ", " A   A ", "AAAAAAA", "A     A", "A     A"],
        B: ["BBBBBB ", "B    B ", "BBBBBB ", "B    B ", "BBBBBB "],
        C: [" CCCCC ", "C     ", "C     ", "C     ", " CCCCC "],
        D: ["DDDDD  ", "D    D ", "D     D", "D    D ", "DDDDD  "],
        E: ["EEEEEEE", "E      ", "EEEEE  ", "E      ", "EEEEEEE"],
        F: ["FFFFFFF", "F      ", "FFFF   ", "F      ", "F      "],
        G: [" GGGGG ", "G      ", "G  GGG ", "G    G ", " GGGGG "],
        H: ["H     H", "H     H", "HHHHHHH", "H     H", "H     H"],
        I: ["IIIIIII", "  III  ", "  III  ", "  III  ", "IIIIIII"],
        J: ["JJJJJJJ", "    J  ", "    J  ", "J   J  ", " JJJJ  "],
        K: ["K    K ", "K   K  ", "KKK    ", "K   K  ", "K    K "],
        L: ["L      ", "L      ", "L      ", "L      ", "LLLLLLL"],
        M: ["M     M", "MM   MM", "M M M M", "M  M  M", "M     M"],
        N: ["N     N", "NN    N", "N N   N", "N  N  N", "N   NN N"],
        O: [" OOOOO ", "O     O", "O     O", "O     O", " OOOOO "],
        P: ["PPPPPP ", "P    P ", "PPPPPP ", "P      ", "P      "],
        Q: [" QQQQQ ", "Q     Q", "Q     Q", "Q  Q Q ", " QQQQQL"],
        R: ["RRRRRR ", "R    R ", "RRRRRR ", "R   R  ", "R    R "],
        S: [" SSSSS ", "S      ", " SSSSS ", "     S ", "SSSSS  "],
        T: ["TTTTTTT", "  T  T ", "  T  T ", "  T  T ", "  T  T "],
        U: ["U     U", "U     U", "U     U", "U     U", " UUUUU "],
        V: ["V     V", "V     V", "V     V", " V   V ", "  V V  "],
        W: ["W     W", "W     W", "W  W  W", "W  W  W", " WW WW "],
        X: ["X     X", " X   X ", "  XXX  ", " X   X ", "X     X"],
        Y: ["Y     Y", " Y   Y ", "  YYY  ", "   Y   ", "   Y   "],
        Z: ["ZZZZZZZ", "    Z  ", "  Z    ", " Z     ", "ZZZZZZZ"],
        " ": ["       ", "       ", "       ", "       ", "       "],
        "0": [" 00000 ", "0    0 ", "0    0 ", "0    0 ", " 00000 "],
        "1": ["  11   ", " 111   ", "  11   ", "  11   ", " 11111 "],
        "2": [" 22222 ", "2    2 ", "   22  ", " 22    ", "222222 "],
        "3": [" 33333 ", "     3 ", "  333  ", "     3 ", " 33333 "],
        "4": ["4    4 ", "4    4 ", "444444 ", "     4 ", "     4 "],
        "5": ["555555 ", "5      ", "55555  ", "     5 ", "55555  "],
        "6": [" 66666 ", "6      ", "66666  ", "6    6 ", " 66666 "],
        "7": ["777777 ", "    7  ", "   7   ", "  7    ", " 7     "],
        "8": [" 88888 ", "8    8 ", " 88888 ", "8    8 ", " 88888 "],
        "9": [" 99999 ", "9    9 ", " 99999 ", "     9 ", " 99999 "],
        "!": ["  !!!  ", "  !!!  ", "  !!!  ", "       ", "  !!!  "],
        "?": [" ???   ", "   ?   ", "  ?    ", "       ", "  ?    "]
    }
};

function textToAscii(text) {
    if (FIGLET) {
        try {
            return FIGLET.textSync(text, { font: "Standard", horizontalLayout: "default" });
        } catch {}
    }
    // Built-in fallback
    const font = ASCII_FONTS.standard;
    const chars = text.toUpperCase().split("");
    const height = 5;
    let lines = [];
    for (let row = 0; row < height; row++) {
        let line = "";
        for (const char of chars) {
            const glyph = font[char] || font["?"] || ["???????"];
            line += (glyph[row] || "       ") + " ";
        }
        lines.push(line.trimEnd());
    }
    return lines.join("\n");
}

module.exports = {
    name: "ascii",
    aliases: ["asciitext", "textart"],
    category: "maker",
    permissions: {
        coin: 5
    },

    code: async (ctx) => {
        const input = ctx.text || ctx.quoted?.body;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "Moonson")}\n` +
                ctx.format.generateNotes([
                    "Convert text to ASCII art",
                    "Maximum 20 characters for best results"
                ])
            );

        if (input.length > 20)
            return await ctx.reply(ctx.format.info("Text too long! Maximum 20 characters for ASCII art."));

        try {
            const asciiArt = textToAscii(input);

            await ctx.reply({
                text: `🎨 *ASCII ART*\n\n\`\`\`\n${asciiArt}\n\`\`\``,
                buttons: [
                    { text: "Make Another", id: `${ctx.used.prefix}${ctx.used.command}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
