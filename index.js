require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const handleXPAndCoins = require('./commands/xp-coins');
const handleBankCheck = require('./commands/bank-check');
const handleLevelCheck = require('./commands/level-check');
const handleInventoryCheck = require('./commands/inventory-check');
const { shopItems } = require('./commands/shop'); // Importeer shopItems
const User = require('./models/user');
const port = process.env.PORT || 3000;
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

                case 'shop':
                    const { handleShop } = require('./commands/shop');
                    await handleShop(message);
                    break;

                default:
                    message.reply('❌ Onbekend commando!');
                    break;
                case 'inventory-check':
                    await handleInventoryCheck(message);
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

    const userId = interaction.user.id;
    const user = await User.findOne({ discordId: userId });

    if (!user) {
        return interaction.reply({ content: '❌ Je bent niet geregistreerd.', ephemeral: true });
    }

    if (interaction.customId === 'shop-select') {
        const selectedItem = shopItems.find(item => item.id === interaction.values[0]);

        if (!selectedItem) {
            return interaction.reply({ content: '❌ Dit item bestaat niet!', ephemeral: true });
        }

        if (user.coins < selectedItem.price) {
            return interaction.reply({ content: `❌ Je hebt niet genoeg coins voor de ${selectedItem.name}.`, ephemeral: true });
        }

        user.coins -= selectedItem.price; // Verwijder coins
        user.inventory.push(selectedItem.name); // Voeg het item toe aan de inventory
        await user.save(); // Sla de gebruiker op

        return interaction.reply({ content: `✅ Je hebt succesvol een ${selectedItem.name} gekocht voor ${selectedItem.price} coins!`, ephemeral: true });
    }

    if (interaction.customId === 'close-shop') {
        return interaction.message.delete(); // Sluit de winkel door het bericht te verwijderen
    }
});



client.login(process.env.DISCORD_TOKEN);
