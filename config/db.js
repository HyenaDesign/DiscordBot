const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
};

module.exports = connectDB;
