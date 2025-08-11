import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSettings from './Models/systemSettings.model.js';

// Load environment variables
dotenv.config();

const seedSystemSettings = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if system settings already exist
        const existingSettings = await SystemSettings.findOne();
        if (existingSettings) {
            console.log('⚠️  System settings already exist');
            console.log('Settings ID:', existingSettings._id);
            console.log('Last updated:', existingSettings.updatedAt);
            return;
        }

        // Create default system settings
        const defaultSettings = await SystemSettings.create({});
        
        console.log('✅ System settings created successfully!');
        console.log('Settings ID:', defaultSettings._id);
        console.log('Created at:', defaultSettings.createdAt);

    } catch (error) {
        console.error('❌ Error seeding system settings:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the seed function
seedSystemSettings();
