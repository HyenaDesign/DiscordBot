const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    discordId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true,  // Ensure `discordId` is indexed for faster lookups
    },
    xp: { 
        type: Number, 
        default: 0 
    },
    coins: { 
        type: Number, 
        default: 0 
    },
    level: { 
        type: Number, 
        default: 0 
    },
    inventory: { 
        type: [String], 
        default: [] 
    },
}, { timestamps: true });  // Add createdAt and updatedAt fields

// Method to calculate XP needed for the next level (just an example)
userSchema.methods.getXPForNextLevel = function() {
    // You can modify this to match your leveling system
    return Math.floor(this.level * 1000 + 500); // Example: 1000 + 500 XP per level
};

// Add a method to level up the user
userSchema.methods.levelUp = function() {
    const xpForNextLevel = this.getXPForNextLevel();
    
    // Check if user has enough XP to level up
    if (this.xp >= xpForNextLevel) {
        this.level += 1;
        this.xp -= xpForNextLevel; // Deduct XP for the next level

        return true; // Level up success
    }
    return false; // Not enough XP to level up
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
