const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Functie om alle commando's te verwijderen
(async () => {
    try {
        console.log('🔄 Verwijderen van globale commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('✅ Alle globale commands zijn verwijderd.');

        console.log('🔄 Verwijderen van guild-specifieke commands...');
        const guildId = '934583352407752704'; // Vervang door je server ID
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: [] });
        console.log('✅ Alle guild-specifieke commands zijn verwijderd.');
    } catch (error) {
        console.error('❌ Er is een fout opgetreden:', error);
    }
})();
