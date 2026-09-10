module.exports = {
    name: "colorinfo",
    aliases: ["color", "colour"],
    category: "maker",

    code: async (ctx) => {
        const input = ctx.text?.trim();

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "#FF5733")}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "blue")}\n` +
                ctx.format.generateNotes([
                    "Get color information from hex code or color name",
                    "Returns RGB, HSL, HSV, CMYK values and a preview image"
                ])
            );

        try {
            const { Color } = (() => {
                try { return { Color: require("color") }; } catch { return { Color: null }; }
            })();

            // Color name to hex mapping
            const NAMED_COLORS = {
                red: "#FF0000", green: "#00FF00", blue: "#0000FF",
                yellow: "#FFFF00", cyan: "#00FFFF", magenta: "#FF00FF",
                orange: "#FFA500", purple: "#800080", pink: "#FFC0CB",
                black: "#000000", white: "#FFFFFF", gray: "#808080",
                grey: "#808080", brown: "#A52A2A", navy: "#000080",
                teal: "#008080", lime: "#00FF00", gold: "#FFD700",
                silver: "#C0C0C0", maroon: "#800000", olive: "#808000",
                coral: "#FF7F50", salmon: "#FA8072", khaki: "#F0E68C",
                lavender: "#E6E6FA", turquoise: "#40E0D0", indigo: "#4B0082",
                crimson: "#DC143C", beige: "#F5F5DC", mint: "#98FF98"
            };

            let hex;
            const lowerInput = input.toLowerCase();

            if (/^#?[0-9A-Fa-f]{6}$/.test(input.replace("#", ""))) {
                hex = input.startsWith("#") ? input.toUpperCase() : "#" + input.toUpperCase();
            } else if (NAMED_COLORS[lowerInput]) {
                hex = NAMED_COLORS[lowerInput].toUpperCase();
            } else if (/^#?[0-9A-Fa-f]{3}$/.test(input.replace("#", ""))) {
                const s = input.replace("#", "");
                hex = "#" + s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
                hex = hex.toUpperCase();
            } else {
                return await ctx.reply(ctx.format.info(`Unrecognized color "${input}". Use hex (#FF5733) or a common color name.`));
            }

            // Convert hex to RGB, HSL, HSV, CMYK
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            // RGB
            const rgb = `${r}, ${g}, ${b}`;

            // HSL
            const rN = r / 255, gN = g / 255, bN = b / 255;
            const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
                    case gN: h = (bN - rN) / d + 2; break;
                    case bN: h = (rN - gN) / d + 4; break;
                }
                h /= 6;
            }
            const hsl = `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;

            // HSV
            const maxV = max, minV = min, v = maxV, d = maxV - minV;
            const sv = maxV === 0 ? 0 : d / maxV;
            let hv;
            if (d === 0) hv = 0;
            else if (maxV === rN) hv = ((gN - bN) / d) % 6;
            else if (maxV === gN) hv = (bN - rN) / d + 2;
            else hv = (rN - gN) / d + 4;
            hv = Math.round(hv * 60);
            if (hv < 0) hv += 360;
            const hsv = `${hv}, ${Math.round(sv * 100)}%, ${Math.round(v * 100)}%`;

            // CMYK
            const k = 1 - Math.max(rN, gN, bN);
            const c = k < 1 ? (1 - rN - k) / (1 - k) : 0;
            const m = k < 1 ? (1 - gN - k) / (1 - k) : 0;
            const y = k < 1 ? (1 - bN - k) / (1 - k) : 0;
            const cmyk = `${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%`;

            // Find closest named color
            let closest = "Unknown", minDist = Infinity;
            for (const [name, h2] of Object.entries(NAMED_COLORS)) {
                const r2 = parseInt(h2.slice(1, 3), 16);
                const g2 = parseInt(h2.slice(3, 5), 16);
                const b2 = parseInt(h2.slice(5, 7), 16);
                const dist = Math.sqrt((r-r2)**2 + (g-g2)**2 + (b-b2)**2);
                if (dist < minDist) { minDist = dist; closest = name; }
            }

            // Generate a solid color preview image via a simple data URL approach
            const previewUrl = `https://placehold.co/400x200/${hex.slice(1)}/FFFFFF?text=${encodeURIComponent(hex)}`;

            await ctx.reply({
                image: { url: previewUrl },
                caption:
                    `🎨 *COLOR INFO*\n\n` +
                    `❯ ${ctx.format.bold("Hex")}: ${hex}\n` +
                    `❯ ${ctx.format.bold("RGB")}: rgb(${rgb})\n` +
                    `❯ ${ctx.format.bold("HSL")}: hsl(${hsl})\n` +
                    `❯ ${ctx.format.bold("HSV")}: hsv(${hsv})\n` +
                    `❯ ${ctx.format.bold("CMYK")}: cmyk(${cmyk})\n` +
                    `❯ ${ctx.format.bold("Closest Name")}: ${closest}`,
                buttons: [
                    { text: "Make Another", id: `${ctx.used.prefix}${ctx.used.command}` }
                ]
            });
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
