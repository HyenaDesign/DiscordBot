const User = require('../models/user');

const handleXPAndCoins = async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    // Zoek de gebruiker in de database
    let user = await User.findOne({ discordId: userId });
    if (!user) {
        user = await User.create({ discordId: userId });
        message.reply("Welkom! Je hebt je eerste 10 XP en 5 coins verdiend! 🎉");
    }

    // Update XP en coins
    user.xp += 10;
    user.coins += 5;
    await user.save();

    message.reply(`Je hebt 10 XP en 5 coins verdiend! 🎉 Je hebt nu ${user.xp} XP en ${user.coins} coins.`);
};

module.exports = handleXPAndCoins;
