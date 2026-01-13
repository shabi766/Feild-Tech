import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.COMPANY_DB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/fieldtech_company";
        await mongoose.connect(mongoURI);
        console.log('✅ Company Service: MongoDB connected successfully');
    } catch (error) {
        console.log('❌ Company Service: MongoDB connection failed:', error.message);
        console.log('💡 Please ensure MongoDB is running or set MONGO_URI in .env file');
    }
}

export default connectDB;
