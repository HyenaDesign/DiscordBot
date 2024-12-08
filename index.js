require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');

// Import the XP and Coins handler
const handleXPAndCoins = require('./commands/xp-coins');  // Ensure correct path to xp-coins.js

// Validate environment variables
if (!process.env.MONGO_URI || !process.env.DISCORD_TOKEN) {
    console.error('❌ Missing required environment variables: MONGO_URI or DISCORD_TOKEN');
    process.exit(1); // Exit the process if environment variables are missing
}

// Mongoose connection
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("✅ Connected to MongoDB!"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Exit if the connection fails
    });

// Create the Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Register commands dynamically
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        if (command.data && command.data.name) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
            console.warn(`❌ Command in file ${file} does not have valid structure.`);
        }
    } catch (error) {
        console.error(`❌ Error loading command from ${file}:`, error);
    }
}

// Register slash commands to Discord API
client.once('ready', async () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.commands.map(cmd => cmd.data.toJSON()) }
        );
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }
});

// Handle interactions (slash commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.warn(`❌ Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('❌ Error executing command:', error);
        await interaction.reply({ content: '❌ Er is een fout opgetreden bij het uitvoeren van dit commando.', ephemeral: true });
    }
});

// Handle XP and coins when a message is sent (every message)
client.on('messageCreate', handleXPAndCoins);  // This triggers the XP and coins logic

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
