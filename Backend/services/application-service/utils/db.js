import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.APPLICATION_DB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/fieldtech_application";
        await mongoose.connect(mongoURI);
        console.log('✅ Application Service: MongoDB connected successfully');
    } catch (error) {
        console.log('❌ Application Service: MongoDB connection failed:', error.message);
        console.log('💡 Please ensure MongoDB is running or set MONGO_URI in .env file');
    }
}

export default connectDB;
