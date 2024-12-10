const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/user'); // Zorg ervoor dat je gebruikersmodel correct is geïmporteerd

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Claim je dagelijkse 40 coins (1 keer per 4 uur)!'),

    async execute(interaction) {
        // Haal de gebruiker op uit de database
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            // Als de gebruiker niet bestaat, maak een nieuwe gebruiker aan en zet lastClaim naar de huidige tijd
            user = await User.create({ discordId: userId, xp: 0, coins: 0, level: 0, lastClaim: Date.now() });
        }

        // Krijg de laatste claimtijd van de gebruiker
        const lastClaimTime = user.lastClaim;
        const currentTime = Date.now();

        // Bereken het verschil tussen nu en de laatste claim (in milliseconden)
        const timeDifference = currentTime - lastClaimTime;
        const cooldownTime = 4 * 60 * 60 * 1000; // 4 uur in milliseconden

        if (timeDifference < cooldownTime) {
            const remainingTime = cooldownTime - timeDifference;
            const hoursRemaining = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutesRemaining = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

            return interaction.reply({
                content: `⏳ Je kunt pas weer claimen in ${hoursRemaining} uur(s) en ${minutesRemaining} minuut/minuten.`,
                ephemeral: true,
            });
        }

        // Voeg 40 coins toe aan de gebruiker
        user.coins += 40;
        // Werk de laatste claimtijd bij
        user.lastClaim = currentTime;
        await user.save();

        // Maak een embed voor het claimen van de coins
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🎉 Coins Geclaimed! 🎉')
            .setDescription(`Je hebt **40 coins** geclaimd! Je kunt weer claimen over 4 uur.`)
            .setFooter({ text: 'Veel plezier met je coins!' });

        // Beantwoord de interactie met een embed
        await interaction.reply({ embeds: [embed] });
    },
};
