const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        // await mongoose.connect(`${process.env.MONGODB_ALATAS_URL}`);
        await mongoose.connect(`${process.env.MONGODB_ALATAS_URL}`);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

module.exports = connectDB;