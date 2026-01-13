import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Use a default MongoDB URI if not provided
        // For microservices, you might want to use a separate database or collection
        const mongoURI = process.env.NOTIFICATION_DB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/fieldtech_notification";
        await mongoose.connect(mongoURI);
        console.log('✅ Notification Service: MongoDB connected successfully');
    } catch (error) {
        console.log('❌ Notification Service: MongoDB connection failed:', error.message);
        console.log('💡 Please ensure MongoDB is running or set MONGO_URI in .env file');
        // Don't exit the process, let it continue without database
    }
}

export default connectDB;
