import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'shoaibkayani8@gmail.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('User ID:', existingAdmin._id);
            console.log('Role:', existingAdmin.role);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('Shoaib@99', 10);

        // Create admin user
        const adminUser = await User.create({
            fullname: 'Shoaib Kayani',
            email: 'shoaibkayani8@gmail.com',
            phoneNumber: 1234567890, // You can update this
            password: hashedPassword,
            cnic: '12345-1234567-1', // You can update this
            role: 'Admin', // Using 'Admin' as per the model enum
            profile: {
                bio: 'System Administrator',
                profilePhoto: '/default-avatar.png',
            },
            kyc: {
                kycStatus: 'verified',
            },
            status: 'online',
        });

        console.log('✅ Admin user created successfully!');
        console.log('User ID:', adminUser._id);
        console.log('Email:', adminUser.email);
        console.log('Role:', adminUser.role);
        console.log('Password: Shoaib@99');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the seed function
seedAdmin();
