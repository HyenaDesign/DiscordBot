const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');
const calculateNextLevelXP = require('./utils/level-system');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-check')
        .setDescription('Bekijk je huidige level en XP naar het volgende level.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            return interaction.reply("Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
        }

        const currentLevel = user.level || 1;
        const nextLevelXP = calculateNextLevelXP(currentLevel);
        const xpToNextLevel = nextLevelXP - user.xp;
        const xpProgress = Math.round((user.xp / nextLevelXP) * 100);  // XP as a percentage of the next level

        return interaction.reply(
            `Je level is ${currentLevel}. Je hebt nog ${xpToNextLevel} XP nodig om level ${currentLevel + 1} te bereiken. ` +
            `Je hebt ${xpProgress}% van het huidige level voltooid.`
        );
    },
};
