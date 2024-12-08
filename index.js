require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const handleXPAndCoins = require('./commands/xp-coins');
const handleBankCheck = require('./commands/bank-check'); // Bank-check command

const PREFIX = '!'; // Standaard prefix voor commands

// Database Setup
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log("✅ Connected to MongoDB!");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
});

// Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);
});

// Handle messages (voor prefix-based commands zoals !bank-check)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
        const [command, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
        switch (command) {
            case 'bank-check':
                await handleBankCheck(message, args); // Roep de bank-check command aan
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

// Slash Command Handler (voor slash-based commands zoals /bank-check)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'bank-check') {
        await handleBankCheck(interaction);
    } else {
        interaction.reply('❌ Onbekend slash commando!');
    }
});

// Start de bot
client.login(process.env.DISCORD_TOKEN);
