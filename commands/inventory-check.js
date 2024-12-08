const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory-check')
        .setDescription('Bekijk je inventaris.'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const user = await User.findOne({ discordId: userId });

            if (!user) {
                return interaction.reply("❌ Je bent nog niet geregistreerd!");
            }

            if (!user.inventory || user.inventory.length === 0) {
                return interaction.reply("🛍️ Je inventaris is leeg!");
            }

            // If inventory is an array of strings (simple item names)
            const inventoryList = user.inventory.join(', ');
            
            // If inventory is an array of objects with name/quantity properties
            // const inventoryList = user.inventory.map(item => `${item.name} (x${item.quantity})`).join(', ');

            return interaction.reply(`🛍️ Je hebt de volgende items in je inventaris: ${inventoryList}`);
        } catch (error) {
            console.error('Error in inventory-check:', error);
            return interaction.reply('❌ Er is een fout opgetreden bij het ophalen van je inventaris.');
        }
    },
};
