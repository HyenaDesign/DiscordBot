require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// Database Setup
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log("✅ Connected to MongoDB!");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
});

// Maak een schema voor gebruikers
const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`🚀 Logged in as ${client.user.tag}!`);
});

// Handle messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    // Zoek de gebruiker in de database
    let user = await User.findOne({ discordId: userId });
    if (!user) {
        user = await User.create({ discordId: userId });
        message.reply("Welkom! Je hebt je eerste 10 XP en 5 coins verdiend! 🎉");
    }

    // Update XP en coins
    user.xp += 10;
    user.coins += 5;
    await user.save();

    message.reply(`Je hebt 10 XP en 5 coins verdiend! 🎉 Je hebt nu ${user.xp} XP en ${user.coins} coins.`);
});

// Start de bot
client.login(process.env.DISCORD_TOKEN);
