const mongoose = require('mongoose');

// Maak een schema voor gebruikers
const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    level: { type: Number, default: 0 }, // Nieuw: voegt level toe
    inventory: { type: [String], default: [] } // Nieuw: voegt een array toe voor gekochte items
});

const User = mongoose.model('User', userSchema);

module.exports = User;
