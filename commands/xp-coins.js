const User = require('../models/user');
const calculateNextLevelXP = require('./utils/level-system');

const handleXPAndCoins = async (message) => {
    // Don't reward XP or coins to bots
    if (message.author.bot) return;

    const userId = message.author.id;

    // Zoek de gebruiker in de database
    let user = await User.findOne({ discordId: userId });

    if (!user) {
        // Als de gebruiker nog niet bestaat, maak dan de gebruiker aan
        user = new User({
            discordId: userId,
            xp: 0,
            coins: 0,
            level: 0,
        });

        // Stuur een welkomstbericht als de gebruiker nieuw is
        message.reply(`🎉 Welkom, ${message.author.username}! Je ontvangt nu **10 XP** en **5 coins** voor elk bericht! Geniet ervan! 🎉`);
    }

    // Beloon de gebruiker met XP en coins
    user.xp += 10; // Aantal XP per bericht
    user.coins += 5; // Aantal coins per bericht

    // Controleer of de gebruiker is opgeklommen naar een nieuw level
    const nextLevelXP = calculateNextLevelXP(user.level);
    if (user.xp >= nextLevelXP) {
        user.level += 1; // Verhoog het level als de gebruiker genoeg XP heeft
        await user.save();

        message.reply(`🎉 Gefeliciteerd! Je bent nu level ${user.level}!`);
    } else {
        await user.save();
    }
};

module.exports = handleXPAndCoins;
