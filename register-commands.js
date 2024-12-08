require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Laad de benodigde omgevingsvariabelen
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID; // Zorg dat je CLIENT_ID toevoegt aan je .env
const guildId = process.env.GUILD_ID; // Alleen nodig voor guild-specifieke registratie

// Verzamel alle commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands'); // Map waar je command files staan
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Laad de data van alle command files
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON()); // Converteer de command data naar JSON
    } else {
        console.warn(`[WAARSCHUWING] Het command in ${file} heeft geen "data" of "execute" property.`);
    }
}

// Instantieer de REST client
const rest = new REST({ version: '10' }).setToken(token);

// Registratieproces
(async () => {
    try {
        console.log('🔄 Start registratie van slash commands...');

        // Voor guild-specifieke registratie (sneller voor testen)
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log('✅ Guild-specifieke commands succesvol geregistreerd.');
        }

        // Voor globale registratie (kan langer duren om actief te worden)
        else {
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log('✅ Globale commands succesvol geregistreerd.');
        }
    } catch (error) {
        console.error('❌ Er is een fout opgetreden bij het registreren van commands:', error);
    }
})();
