require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const handleXPAndCoins = require('./commands/xp-coins');
const handleBankCheck = require('./commands/bank-check'); // Bank-check command
const handleLevelCheck = require('./commands/level-check');

const PREFIX = '!'; // Standaard prefix voor commands

// Database Setup
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log("✅ Connected to MongoDB!");
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
    });

// Bot Setup
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);
});

// Handle messages (voor prefix-based commands zoals !bank-check)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Voorkom dat de bot op eigen berichten reageert

    if (message.content.startsWith(PREFIX)) {
        const [command, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
        switch (command) {
            case 'bank-check':
                await handleBankCheck(message, args); // Roep de bank-check command aan
                break;
            
            case 'level-check':
                await handleLevelCheck(message); // Roep de level-check command aan
                break;

            default:
                message.reply('❌ Onbekend commando!');
                break;
        }
    } else {
        // Verwerk normale berichten voor XP en coins
        await handleXPAndCoins(message);
    }
});

// Start de bot
client.login(process.env.DISCORD_TOKEN);
