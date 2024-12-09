const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Zorg ervoor dat je gebruikersmodel correct is geïmporteerd
const calculateNextLevelXP = require('./utils/level-system'); // Als je dit ook nodig hebt

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slotmachine')
        .setDescription('Speel de slot machine en win geweldige prijzen!'),

    async execute(interaction) {
        // Haal de gebruiker op uit de database
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            // Als de gebruiker niet bestaat, maak een nieuwe gebruiker aan
            user = await User.create({ discordId: userId, xp: 0, coins: 0, level: 0 });
        }

        // Controleer of de gebruiker genoeg coins heeft
        const spinCost = 10;
        if (user.coins < spinCost) {
            return interaction.reply({
                content: '😢 Je hebt niet genoeg coins om te spinnen! Je hebt minstens 5 coins nodig.',
                ephemeral: true,
            });
        }

        // Verminder de coins voor het draaien
        user.coins -= spinCost;
        await user.save();

        // Slot Machine-symbolen
        const symbols = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎'];

        // Maak een embed met uitleg
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🎰 Slot Machine 🎰')
            .setDescription('Klik op **Spin** om je geluk te testen!')
            .setFooter({ text: 'Veel geluk!' });

        // Maak de knoppen
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('spin')
                .setLabel('Spin for 5 coins')
                .setStyle(ButtonStyle.Success)
        );

        // Stuur de embed met knoppen
        await interaction.reply({ embeds: [embed], components: [row] });

        // Maak een collector voor de knoppen
        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'spin') {
                // Genereer willekeurige symbolen
                const slotResult = [
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                ];

                // Bepaal winst/verlies
                const win = slotResult[0] === slotResult[1] && slotResult[1] === slotResult[2];
                const winAmount = win ? 50 : 0; // Pas dit aan voor de winst
                const resultMessage = win
                    ? `🎉 **GEWONNEN!** Je hebt ${winAmount} coins gewonnen! 🎉`
                    : `😢 Helaas, probeer het nog eens!`;

                // Update de coins bij winst
                if (win) {
                    user.coins += winAmount;
                }

                await user.save();

                // Update de embed met de uitkomst
                const resultEmbed = new EmbedBuilder()
                    .setColor(win ? 'Green' : 'Red')
                    .setTitle('🎰 Slot Machine 🎰')
                    .setDescription(`**Resultaat:** ${slotResult.join(' | ')}`)
                    .addFields({ name: 'Status', value: resultMessage })
                    .setFooter({ text: 'Speel opnieuw om je geluk te testen!' });

                await btnInteraction.update({ embeds: [resultEmbed], components: [row] });
            }
        });

        collector.on('end', () => {
            // Disable de knoppen na afloop
            row.components.forEach((button) => button.setDisabled(true));
            interaction.editReply({ components: [row] });
        });
    },
};
