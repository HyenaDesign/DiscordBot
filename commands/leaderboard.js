const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const User = require('../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Bekijk de top gebruikers op basis van level of coins.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Kies de leaderboard type')
                .setRequired(true)
                .addChoices(
                    { name: 'Level', value: 'level' },
                    { name: 'Coins', value: 'coins' }
                )),
    async execute(interaction) {
        const leaderboardType = interaction.options.getString('type');

        // Fetch top 10 users based on level or coins
        let users;
        if (leaderboardType === 'level') {
            users = await User.find().sort({ level: -1 }).limit(10); // Sort by level (descending)
        } else if (leaderboardType === 'coins') {
            users = await User.find().sort({ coins: -1 }).limit(10); // Sort by coins (descending)
        }

        if (!users || users.length === 0) {
            return interaction.reply('❌ Er zijn geen gebruikers om weer te geven!');
        }

        // Create leaderboard embed
        const leaderboardEmbed = new EmbedBuilder()
            .setTitle(`🏆 Leaderboard - Top 10 ${leaderboardType.charAt(0).toUpperCase() + leaderboardType.slice(1)}`)
            .setColor(0x00AE86)
            .setTimestamp();

        // Fetch usernames and add top users to the embed
        for (const [index, user] of users.entries()) {
            try {
                // Fetch the Discord user object by their discordId
                const discordUser = await interaction.client.users.fetch(user.discordId);

                // Add the user to the embed
                leaderboardEmbed.addFields({
                    name: `${index + 1}. ${discordUser.username}#${discordUser.discriminator}`,
                    value: `${leaderboardType.charAt(0).toUpperCase() + leaderboardType.slice(1)}: ${user[leaderboardType]}`,
                    inline: false
                });
            } catch (err) {
                console.error('Error fetching user data:', err);
                leaderboardEmbed.addFields({
                    name: `${index + 1}. Unknown User`,
                    value: `${leaderboardType.charAt(0).toUpperCase() + leaderboardType.slice(1)}: ${user[leaderboardType]}`,
                    inline: false
                });
            }
        }

        return interaction.reply({ embeds: [leaderboardEmbed] });
    },
};
