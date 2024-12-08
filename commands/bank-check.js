const User = require('../models/user');

// Voor prefix commands
const handleBankCheck = async (message, args) => {
    const userId = message.author.id;
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        return message.reply("Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
    }

    message.reply(`🏦 Je hebt momenteel ${user.coins} coins in je bank.`);
};

// Voor slash commands
const handleSlashBankCheck = async (interaction) => {
    const userId = interaction.user.id;
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        return interaction.reply("Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
    }

    interaction.reply(`🏦 Je hebt momenteel ${user.coins} coins in je bank.`);
};

module.exports = async (input, args) => {
    // Detecteer of input een interaction of een message is
    if (input.isCommand) {
        await handleSlashBankCheck(input);
    } else {
        await handleBankCheck(input, args);
    }
};
