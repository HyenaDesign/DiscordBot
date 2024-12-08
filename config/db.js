const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log('✅ Verbonden met MongoDB');
    } catch (err) {
        console.error('❌ MongoDB-verbinding mislukt:', err);
    }
};

module.exports = connectToDatabase;
