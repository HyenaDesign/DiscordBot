const { SlashCommandBuilder } = require('@discordjs/builders'); // Correct import
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank-check')
        .setDescription('Bekijk je bankbalans.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const user = await User.findOne({ discordId: userId });

            if (!user) {
                return interaction.reply("Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
            }

            return interaction.reply(`🏦 Je hebt momenteel ${user.coins} coins in je bank.`);
        } catch (error) {
            console.error('Error fetching user data:', error);
            return interaction.reply("Er is een fout opgetreden bij het ophalen van je gegevens. Probeer het later opnieuw.");
        }
    },
};
