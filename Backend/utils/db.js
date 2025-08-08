import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Use a default MongoDB URI if not provided
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/alpha_project";
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('💡 Please ensure MongoDB is running or set MONGO_URI in .env file');
        // Don't exit the process, let it continue without database
    }
}
export default connectDB;