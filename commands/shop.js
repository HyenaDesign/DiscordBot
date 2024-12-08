const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('@discordjs/builders');
const User = require('../models/user');

const shopItems = [
    { id: 'item1', name: '<:soldat:1031921580483293235>', price: 20 },
    { id: 'item2', name: 'Schild', price: 150 },
    { id: 'item3', name: 'Helm', price: 200 },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Bekijk en koop items in de winkel.'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const user = await User.findOne({ discordId: userId });

            if (!user) {
                return interaction.reply("❌ Je bent nog niet geregistreerd! Stuur een bericht om je eerste XP en coins te verdienen.");
            }

            const shopEmbed = new EmbedBuilder()
                .setTitle('🛒 Winkel')
                .setDescription('Kies een item om te kopen:')
                .setColor(0x00AE86);

            shopItems.forEach(item => {
                shopEmbed.addFields({ name: item.name, value: `💰 ${item.price} coins`, inline: true });
            });

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

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close-shop')
                    .setLabel('Sluiten')
                    .setStyle(ButtonStyle.Danger)
            );

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);
            return interaction.reply({ embeds: [shopEmbed], components: [actionRow, buttonRow] });
        } catch (error) {
            console.error('Error in shop command:', error);
            return interaction.reply('❌ Er is een fout opgetreden bij het openen van de winkel.');
        }
    },
    async onSelectMenuInteraction(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        const userId = interaction.user.id;
        const user = await User.findOne({ discordId: userId });

        if (!user) {
            return interaction.reply("❌ Je bent nog niet geregistreerd!");
        }

        const selectedItem = shopItems.find(item => item.id === interaction.values[0]);

        if (!selectedItem) {
            return interaction.reply("❌ Ongeldig item geselecteerd.");
        }

        if (user.coins < selectedItem.price) {
            return interaction.reply(`❌ Je hebt niet genoeg coins om ${selectedItem.name} te kopen! Je hebt maar ${user.coins} coins.`);
        }

        // Deduct the coins and add the item to inventory
        user.coins -= selectedItem.price;
        user.inventory.push(selectedItem.name); // You could store the item's ID instead of the name
        await user.save();

        return interaction.reply(`✅ Je hebt ${selectedItem.name} gekocht voor ${selectedItem.price} coins! Je hebt nu ${user.coins} coins over.`);
    },
    async onButtonInteraction(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'close-shop') {
            return interaction.update({
                content: '🛒 De winkel is gesloten.',
                components: []
            });
        }
    },
};

module.exports.shopItems = shopItems;
