const mongoose = require('mongoose');

// Maak een schema voor gebruikers
const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
