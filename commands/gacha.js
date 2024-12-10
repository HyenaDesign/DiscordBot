const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Zorg ervoor dat je gebruikersmodel correct is geïmporteerd

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('Speel de Gacha-game en probeer zeldzame items te winnen!'),

    async execute(interaction) {
        // Haal de gebruiker op uit de database
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            // Als de gebruiker niet bestaat, maak een nieuwe gebruiker aan
            user = await User.create({ discordId: userId, xp: 0, coins: 0, level: 0 });
        }

        // Inzet voor de Gacha-game (bijvoorbeeld 20 coins)
        const gachaCost = 20;

        // Controleer of de gebruiker genoeg coins heeft
        if (user.coins < gachaCost) {
            return interaction.reply({
                content: `😢 Je hebt niet genoeg coins om de Gacha-game te spelen! Je hebt minstens ${gachaCost} coins nodig.`,
                ephemeral: true,
            });
        }

        // Verminder de coins van de gebruiker
        user.coins -= gachaCost;
        await user.save();

        // Mogelijke beloningen (ze kunnen aangepast worden naar wens)
        const rewards = [
            { name: '😢 Nothing', value: 0, rarity: 'common' },
            { name: '😢 Nothing', value: 0, rarity: 'common' },
            { name: '😢 Nothing', value: 0, rarity: 'common' },
            { name: '😢 Nothing', value: 0, rarity: 'common' },
            { name: '💰 50 coins', value: 50, rarity: 'common' },
            { name: '🎲 100 coins', value: 100, rarity: 'uncommon' },
            { name: '🛡️ Shield', value: 0, rarity: 'rare' },
            { name: '⚔️ Sword', value: 0, rarity: 'rare' },
            { name: '🌟 Legendary Sword', value: 150, rarity: 'epic' },
        ];

        // Functie om te bepalen of je een legendarische beloning wint (kans is 0.0005% of 1 op 200.000)
        const getGachaReward = () => {
            const roll = Math.random(); // Genereert een getal tussen 0 en 1

            // Kans voor zeldzame beloningen
            if (roll < 0.000005) { // 0.0005% kans (1 op 200.000)
                return { name: '🎉 500 coins', value: 500, rarity: 'legendary' }; // Geef 500 coins als beloning
            }

            // Kies een willekeurige beloning uit de rewards lijst
            return rewards[Math.floor(Math.random() * rewards.length)];
        };

        // Kies de beloning
        const randomReward = getGachaReward();

        // Update de embed met de gewonnen beloning
        const rewardEmbed = new EmbedBuilder()
            .setColor(randomReward.rarity === 'legendary' ? 'Yellow' : randomReward.rarity === 'epic' ? 'Purple' : randomReward.rarity === 'rare' ? 'Blue' : 'Grey')
            .setTitle('🎰 Gacha Game 🎰')
            .setDescription(`Je hebt ${randomReward.name} gewonnen!`)
            .addFields(
                { name: 'Beloning:', value: randomReward.name },
                { name: 'Ingezet:', value: `${gachaCost} coins` },
            )
            .setFooter({ text: 'Veel geluk volgende keer!' });

        // Als de speler coins heeft gewonnen, voeg die toe
        if (randomReward.value > 0) {
            user.coins += randomReward.value;
            await user.save();
        }

        // Maak een knop om opnieuw te spelen
        const playAgainRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('play_again')
                .setLabel('Speel opnieuw')
                .setStyle(ButtonStyle.Primary)
        );

        // Stuur de embed met de beloning en de "Speel opnieuw" knop
        await interaction.reply({ embeds: [rewardEmbed], components: [playAgainRow] });

        // Maak een collector voor de "Speel opnieuw" knop
        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'play_again') {
                // Herstart de Gacha-game voor de speler
                return interaction.editReply({ content: 'Speel de Gacha-game opnieuw!', embeds: [], components: [] });
            }
        });

        collector.on('end', () => {
            // Disable de knop na afloop van de tijd
            playAgainRow.components.forEach((button) => button.setDisabled(true));
            interaction.editReply({ components: [playAgainRow] });
        });
    },
};
