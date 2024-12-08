const User = require('../models/user');
const calculateNextLevelXP = require('./utils/level-system');

const handleXPAndCoins = async (message) => {
    // Don't reward XP or coins to bots
    if (message.author.bot) return;

    const userId = message.author.id;

    // Find or create the user in the database
    let user = await User.findOneAndUpdate(
        { discordId: userId }, 
        { $setOnInsert: { discordId: userId, xp: 0, coins: 0, level: 0 } },
        { new: true, upsert: true }  // This ensures user is created if not found
    );

    // Reward XP and coins
    user.xp += 10; // Modify this to adjust XP per message
    user.coins += 5; // Modify this to adjust coins per message

    // Check if the user leveled up
    const nextLevelXP = calculateNextLevelXP(user.level);
    if (user.xp >= nextLevelXP) {
        user.level += 1; // Increase level if enough XP
        await user.save();

        message.reply(`🎉 Gefeliciteerd! Je bent nu level ${user.level}!`);
    } else {
        await user.save();
    }
};

module.exports = handleXPAndCoins;
