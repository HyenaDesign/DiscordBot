const User = require('../models/user');

const handleInventoryCheck = async (message) => {
    try {
        const userId = message.author.id;
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            return message.reply("❌ Je bent nog niet geregistreerd!");
        }

        if (!user.inventory || user.inventory.length === 0) {
            return message.reply("🛍️ Je inventaris is leeg!");
        }

        const inventoryList = user.inventory.join(', ');
        return message.reply(`🛍️ Je hebt de volgende items in je inventaris: ${inventoryList}`);
    } catch (error) {
        console.error('Error in handleInventoryCheck:', error);
        message.reply('❌ Er is een fout opgetreden bij het ophalen van je inventaris.');
    }
};

module.exports = handleInventoryCheck;
