const User = require('../models/user');
const calculateNextLevelXP = require('./utils/level-system');

const handleXPAndCoins = async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    // Zoek de gebruiker in de database
    let user = await User.findOne({ discordId: userId });
    if (!user) {
        try {
            user = await User.create({ discordId: userId });
            message.reply("Welkom! Je hebt je eerste 10 XP en 5 coins verdiend! 🎉");
        } catch (err) {
            if (err.code === 11000) {
                user = await User.findOne({ discordId: userId });
            } else {
                console.error("❌ Fout bij het maken van gebruiker:", err);
                return;
            }
        }
    }

    // Update XP en coins
    user.xp += 10; // Pas de hoeveelheid XP per bericht hier aan indien nodig
    user.coins += 5;

    // Controleer of de gebruiker genoeg XP heeft voor het volgende level
    const nextLevelXP = calculateNextLevelXP(user.level);
    if (user.xp >= nextLevelXP) {
        user.level += 1; // Verhoog het level
        await user.save();

        message.reply(`🎉 Gefeliciteerd! Je bent nu level ${user.level}!`);
    } else {
        await user.save();
    }
};

module.exports = handleXPAndCoins;
