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

module.exports = handleBankCheck;
