require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Configuraties en verbindingen
const connectDB = require('./config/db');
const handleXPAndCoins = require('./commands/xp-coins');

// Verbinding maken met de database
connectDB();

// Bot Setup
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Bot is ready
client.once('ready', () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);
});

// Handle messages
client.on('messageCreate', async (message) => {
    handleXPAndCoins(message); // Voer de XP en coins logica uit
});

// Start de bot
client.login(process.env.DISCORD_TOKEN);
