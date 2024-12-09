const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Zorg ervoor dat je gebruikersmodel correct is geïmporteerd

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Speel Blackjack en probeer de dealer te verslaan!'),

    async execute(interaction) {
        // Haal de gebruiker op uit de database
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            // Als de gebruiker niet bestaat, maak een nieuwe gebruiker aan
            user = await User.create({ discordId: userId, xp: 0, coins: 0, level: 0 });
        }

        // Controleer of de gebruiker genoeg coins heeft
        const betAmount = 10; // Het bedrag dat een gebruiker moet inzetten om te spelen
        if (user.coins < betAmount) {
            return interaction.reply({
                content: `😢 Je hebt niet genoeg coins om Blackjack te spelen! Je hebt minstens ${betAmount} coins nodig.`,
                ephemeral: true,
            });
        }

        // Verminder de coins voor het spelen
        user.coins -= betAmount;
        await user.save();

        // Kaarten deck en kaarten trekken functie
        const suits = ['♠', '♣', '♦', '♥'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        // Vul het deck
        suits.forEach(suit => {
            values.forEach(value => {
                deck.push(`${value}${suit}`);
            });
        });

        // Functie om een willekeurige kaart te trekken
        const drawCard = () => {
            const cardIndex = Math.floor(Math.random() * deck.length);
            const card = deck.splice(cardIndex, 1)[0]; // Verwijder de kaart uit het deck
            return card;
        };

        // Functie om de score van een hand te berekenen
        const calculateScore = (hand) => {
            let score = 0;
            let aces = 0;
            hand.forEach(card => {
                const value = card.slice(0, -1); // Haal het cijfer of letter uit de kaart
                if (value === 'J' || value === 'Q' || value === 'K') {
                    score += 10;
                } else if (value === 'A') {
                    aces++;
                    score += 11;
                } else {
                    score += parseInt(value);
                }
            });

            // Verwerk Azen (A kan 1 of 11 zijn)
            while (score > 21 && aces > 0) {
                score -= 10;
                aces--;
            }

            return score;
        };

        // Trek de eerste kaarten voor de speler en dealer
        const playerHand = [drawCard(), drawCard()];
        const dealerHand = [drawCard(), drawCard()];

        // Maak de embed voor het spel
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🃏 Blackjack 🃏')
            .setDescription(`**Je hebt ingezet ${betAmount} coins!**\n\nJe hand: ${playerHand.join(' | ')}\nDealer's hand: ${dealerHand[0]} | ❓`)
            .setFooter({ text: 'Klik op een knop om te spelen!' });

        // Maak de knoppen voor acties
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('hit')
                .setLabel('Hit')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('stand')
                .setLabel('Stand')
                .setStyle(ButtonStyle.Danger)
        );

        // Stuur de embed met knoppen
        await interaction.reply({ embeds: [embed], components: [row] });

        // Maak een collector voor de knoppen
        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'hit') {
                // Speler trekt een kaart
                const newCard = drawCard();
                playerHand.push(newCard);
                const playerScore = calculateScore(playerHand);

                // Update de embed met de nieuwe hand van de speler
                const embedUpdate = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('🃏 Blackjack 🃏')
                    .setDescription(`**Je hand: ${playerHand.join(' | ')} (Score: ${playerScore})**\nDealer's hand: ${dealerHand[0]} | ❓`);

                if (playerScore > 21) {
                    embedUpdate.addFields({ name: 'Resultaat', value: '😢 Je hebt verloren! Je hebt meer dan 21 punten.' });
                    row.components.forEach((button) => button.setDisabled(true)); // Disable knoppen na verlies
                    await btnInteraction.update({ embeds: [embedUpdate], components: [row] });
                    await user.save();
                    return collector.stop();
                }

                await btnInteraction.update({ embeds: [embedUpdate], components: [row] });

            } else if (btnInteraction.customId === 'stand') {
                // Dealer speelt
                let dealerScore = calculateScore(dealerHand);
                while (dealerScore < 17) {
                    dealerHand.push(drawCard());
                    dealerScore = calculateScore(dealerHand);
                }

                const playerScore = calculateScore(playerHand);
                let resultMessage = '';

                if (playerScore > 21) {
                    resultMessage = '😢 Je hebt verloren! Je hebt meer dan 21 punten.';
                } else if (dealerScore > 21) {
                    resultMessage = '🎉 **GEWONNEN!** De dealer heeft meer dan 21 punten.';
                    user.coins += betAmount * 2; // Speler wint de inzet
                } else if (playerScore > dealerScore) {
                    resultMessage = '🎉 **GEWONNEN!** Je hebt de dealer verslagen.';
                    user.coins += betAmount * 2; // Speler wint de inzet
                } else if (playerScore < dealerScore) {
                    resultMessage = '😢 De dealer heeft gewonnen.';
                } else {
                    resultMessage = '🔄 Het is een gelijkspel!';
                    user.coins += betAmount; // Teruggeven van de inzet bij gelijkspel
                }

                // Werk de embed bij met het resultaat
                const resultEmbed = new EmbedBuilder()
                    .setColor(playerScore > dealerScore ? 'Green' : 'Red')
                    .setTitle('🃏 Blackjack 🃏')
                    .setDescription(`**Je hand: ${playerHand.join(' | ')} (Score: ${playerScore})**\nDealer's hand: ${dealerHand.join(' | ')} (Score: ${dealerScore})`)
                    .addFields({ name: 'Resultaat', value: resultMessage });

                row.components.forEach((button) => button.setDisabled(true)); // Disable knoppen na afloop
                await btnInteraction.update({ embeds: [resultEmbed], components: [row] });

                await user.save();
                collector.stop();
            }
        });

        collector.on('end', () => {
            row.components.forEach((button) => button.setDisabled(true));
            interaction.editReply({ components: [row] });
        });
    },
};
