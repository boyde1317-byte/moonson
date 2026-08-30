module.exports = {
    name: "calc",
    aliases: ["calculate", "calculator"],
    category: "tool",

    code: async (ctx) => {
        const input = ctx.text;

        if (!input)
            return await ctx.reply(
                `${ctx.format.generateInstruction(["send"], ["text"])}\n` +
                `${ctx.format.generateCmdExample(ctx.used, "2 + 3 * 4")}\n` +
                ctx.format.generateNotes([
                    "Supports: + - * / % ^ ( )",
                    "Also supports: sin, cos, tan, log, sqrt, pi, e",
                    "Example: .calc sqrt(144) + 2^3"
                ])
            );

        try {
            // Sanitize input — only allow math characters, functions, and numbers
            const sanitized = input
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-")
                .trim();

            // Whitelist: digits, operators, parentheses, decimal points, and math functions
            const allowedPattern = /^[\d+\-*/%^().\s]|sin|cos|tan|log|sqrt|pi|e|abs|ceil|floor|round|pow|max|min|cbrt|sign|exp|log2|log10|asin|acos|atan|atan2|sinh|cosh|tanh+]/;

            // Build a safe expression
            let expr = sanitized
                .replace(/\^/g, "**")
                .replace(/(\d+)!/g, (_, n) => {
                    let f = 1;
                    for (let i = 2; i <= parseInt(n); i++) f *= i;
                    return f;
                });

            // Replace math constants and functions
            const MathFuncs = {
                "pi": "Math.PI",
                "e": "Math.E",
                "sqrt(": "Math.sqrt(",
                "sin(": "Math.sin(",
                "cos(": "Math.cos(",
                "tan(": "Math.tan(",
                "log(": "Math.log10(",
                "ln(": "Math.log(",
                "abs(": "Math.abs(",
                "ceil(": "Math.ceil(",
                "floor(": "Math.floor(",
                "round(": "Math.round(",
                "pow(": "Math.pow(",
                "max(": "Math.max(",
                "min(": "Math.min(",
                "cbrt(": "Math.cbrt(",
                "sign(": "Math.sign(",
                "exp(": "Math.exp(",
                "log2(": "Math.log2(",
                "asin(": "Math.asin(",
                "acos(": "Math.acos(",
                "atan(": "Math.atan(",
                "sinh(": "Math.sinh(",
                "cosh(": "Math.cosh(",
                "tanh(": "Math.tanh("
            };

            for (const [key, val] of Object.entries(MathFuncs)) {
                expr = expr.replace(new RegExp(key.replace(/[()]/g, "\\$&"), "g"), val);
            }

            // Validate the final expression — only allow safe characters
            if (!/^[\d+\-*/%().\sMathPE.,]+$/.test(expr.replace(/Math\.\w+/g, ""))) {
                return await ctx.reply(ctx.format.info("Invalid expression! Only numbers and math operators are allowed."));
            }

            const result = eval(expr);

            if (result === undefined || result === null || isNaN(result)) {
                return await ctx.reply(ctx.format.info("Could not calculate that expression."));
            }

            // Format result nicely
            const formatted = Number.isInteger(result)
                ? result.toString()
                : parseFloat(result.toFixed(8)).toString();

            return await ctx.reply({
                text:
                    `🧮 *CALCULATOR*\n\n` +
                    `❯ ${ctx.format.bold("Input")}: ${sanitized}\n` +
                    `❯ ${ctx.format.bold("Result")}: ${ctx.format.bold(formatted)}`
            });
        } catch (error) {
            return await ctx.reply(ctx.format.info("Invalid expression! Please check your math syntax."));
        }
    }
};
