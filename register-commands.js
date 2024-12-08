const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'bank-check',
        description: 'Bekijk je huidige coins in de bank',
    },
    // Voeg andere commands hier toe
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('⏳ Registeren van slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('✅ Slash commands geregistreerd!');
    } catch (error) {
        console.error('❌ Fout bij registreren van slash commands:', error);
    }
})();
