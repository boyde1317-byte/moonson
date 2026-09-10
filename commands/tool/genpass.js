module.exports = {
    name: "genpass",
    aliases: ["password", "passwordgen", "passgen"],
    category: "tool",

    code: async (ctx) => {
        try {
            const input = (ctx.text || "").toLowerCase().trim();
            const args = input.split(/\s+/);

            let length = 12;
            let count = 1;

            // Parse length and count from args
            for (const arg of args) {
                const num = parseInt(arg);
                if (!isNaN(num)) {
                    if (num >= 4 && num <= 128) length = num;
                    else if (num >= 1 && num <= 10) count = num;
                }
            }

            // Check for flags
            const noSymbols = args.includes("nosymbols") || args.includes("ns");
            const noNumbers = args.includes("nonumbers") || args.includes("nn");
            const noUpper = args.includes("noupper") || args.includes("nu");
            const memorable = args.includes("memorable") || args.includes("m");

            let lowercase = "abcdefghijklmnopqrstuvwxyz";
            let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let numbers = "0123456789";
            let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

            let charset = lowercase;
            if (!noUpper) charset += uppercase;
            if (!noNumbers) charset += numbers;
            if (!noSymbols) charset += symbols;

            // Memorable mode: use only lowercase + numbers, pronounceable pattern
            const generatePassword = (len) => {
                if (memorable) {
                    const consonants = "bcdfghjklmnpqrstvwxz";
                    const vowels = "aeiouy";
                    let pass = "";
                    let useConsonant = true;
                    while (pass.length < len) {
                        const set = useConsonant ? consonants : vowels;
                        pass += set[Math.floor(Math.random() * set.length)];
                        useConsonant = !useConsonant;
                        if (pass.length === Math.floor(len / 2)) pass += (Math.floor(Math.random() * 90) + 10).toString();
                    }
                    return pass;
                }

                let password = "";
                const crypto = require("crypto");
                for (let i = 0; i < len; i++) {
                    const randomByte = crypto.randomBytes(1)[0];
                    password += charset[randomByte % charset.length];
                }
                return password;
            };

            const passwords = [];
            for (let i = 0; i < count; i++) {
                passwords.push(generatePassword(length));
            }

            // Calculate strength
            const calculateStrength = (pass) => {
                let score = 0;
                if (pass.length >= 8) score++;
                if (pass.length >= 12) score++;
                if (pass.length >= 16) score++;
                if (/[a-z]/.test(pass)) score++;
                if (/[A-Z]/.test(pass)) score++;
                if (/[0-9]/.test(pass)) score++;
                if (/[^a-zA-Z0-9]/.test(pass)) score++;
                if (pass.length >= 20) score++;

                if (score <= 3) return { label: "Weak", emoji: "🔴" };
                if (score <= 5) return { label: "Medium", emoji: "🟡" };
                if (score <= 6) return { label: "Strong", emoji: "🟢" };
                return { label: "Very Strong", emoji: "🟢🟢" };
            };

            let text = `🔐 *PASSWORD GENERATOR*\n\n`;

            passwords.forEach((pass, i) => {
                const strength = calculateStrength(pass);
                text += `${ctx.format.bold(`Password ${count > 1 ? i + 1 : ""}`)}: \`${pass}\`\n`;
                text += `❯ ${ctx.format.bold("Length")}: ${pass.length}\n`;
                text += `❯ ${ctx.format.bold("Strength")}: ${strength.emoji} ${strength.label}\n`;
                if (count > 1 || i < passwords.length - 1) text += "\n";
            });

            if (count === 1) {
                text += `\n💡 Tips: Use "memorable" flag for pronounceable passwords, or specify a length (e.g. .genpass 20)`;
            }

            await ctx.reply(text.trim());
        } catch (error) {
            await ctx.helper.handleError(ctx, error, true);
        }
    }
};
