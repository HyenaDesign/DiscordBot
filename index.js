require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const handleXPAndCoins = require('./commands/xp-coins');
const handleBankCheck = require('./commands/bank-check');
const handleLevelCheck = require('./commands/level-check');

const PREFIX = '!'; 

mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log("✅ Connected to MongoDB!");
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
    });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);
});

const userCooldown = {};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (userCooldown[message.author.id]) {
        return;
    }

    userCooldown[message.author.id] = true;

    if (message.content.startsWith(PREFIX)) {
        const [command, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);

        try {
            switch (command) {
                case 'bank-check':
                    await handleBankCheck(message, args); 
                    break;

                case 'level-check':
                    await handleLevelCheck(message); 
                    break;

                default:
                    message.reply('❌ Onbekend commando!');
                    break;
            }
        } catch (error) {
            console.error('Error while processing command:', error);
            message.reply('❌ Er is een fout opgetreden bij het uitvoeren van het commando.');
        }
    } else {
        
        try {
            await handleXPAndCoins(message);
        } catch (error) {
            console.error('Error while handling XP and coins:', error);
        }
    }
    
    setTimeout(() => {
        userCooldown[message.author.id] = false;
    }, 1000); 
});

client.login(process.env.DISCORD_TOKEN);
