const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/user');

// Shop Items
const shopItems = [
    { id: 'item1', name: '<:soldat:1031921580483293235>', price: 20 },
    { id: 'item2', name: 'Schild', price: 150 },
    { id: 'item3', name: 'Helm', price: 200 },
];

const handleShop = async (message) => {
    try {
        const userId = message.author.id;
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            return message.reply("❌ Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
        }

        // Embed met de shop-informatie
        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Winkel')
            .setDescription('Kies een item om te kopen:')
            .setColor(0x00AE86);

        shopItems.forEach(item => {
            shopEmbed.addFields({ name: item.name, value: `💰 ${item.price} coins`, inline: true });
        });

        // Select Menu voor itemselectie
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('shop-select')
            .setPlaceholder('Kies een item...')
            .addOptions(
                shopItems.map(item => ({
                    label: item.name,
                    description: `Prijs: ${item.price} coins`,
                    value: item.id,
                }))
            );

        // Buttons voor extra acties
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close-shop')
                .setLabel('Sluiten')
                .setStyle(ButtonStyle.Danger)
        );

        // Verstuur de interface
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);
        await message.reply({ embeds: [shopEmbed], components: [actionRow, buttonRow] });
    } catch (error) {
        console.error('Error in handleShop:', error);
        message.reply('❌ Er is een fout opgetreden bij het openen van de winkel.');
    }
};

module.exports = { handleShop, shopItems };

