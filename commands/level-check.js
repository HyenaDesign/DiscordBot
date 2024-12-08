const User = require('../models/user');
const calculateNextLevelXP = require('./utils/level-system');

const handleLevelCheck = async (message) => {
    const userId = message.author.id;
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        return message.reply("Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
    }

    const currentLevel = user.level;
    const nextLevelXP = calculateNextLevelXP(currentLevel);

    message.reply(`Je level is ${currentLevel}. Je hebt nog ${nextLevelXP - user.xp} XP tot level ${currentLevel + 1}.`);
};

module.exports = handleLevelCheck;