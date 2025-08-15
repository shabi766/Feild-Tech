import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/alpha_project';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test user login logic
const testUserLogin = async () => {
  try {
    // Find a user with recruiterType: 'Company'
    const companyUser = await User.findOne({ 
      role: 'Recruiter', 
      recruiterType: 'Company' 
    }).select('fullname email role recruiterType companyId phoneNumber cnic profile');
    
    if (companyUser) {
      console.log('✅ Found company user:', {
        _id: companyUser._id,
        fullname: companyUser.fullname,
        email: companyUser.email,
        role: companyUser.role,
        recruiterType: companyUser.recruiterType,
        companyId: companyUser.companyId
      });
      
      // Simulate the login response
      const userForResponse = {
        _id: companyUser._id,
        fullname: companyUser.fullname,
        email: companyUser.email,
        phoneNumber: companyUser.phoneNumber,
        cnic: companyUser.cnic,
        role: companyUser.role,
        recruiterType: companyUser.recruiterType,
        profile: companyUser.profile,
      };
      
      console.log('✅ Login response would be:', userForResponse);
      console.log('✅ User role:', userForResponse.role);
      console.log('✅ User recruiterType:', userForResponse.recruiterType);
      
      // Test the redirect logic
      if (userForResponse.role === 'Recruiter') {
        if (userForResponse.recruiterType === 'Company') {
          console.log('✅ Should redirect to: /app/recruiter/dashboard (Company Dashboard)');
        } else {
          console.log('✅ Should redirect to: /app/recruiter/dashboard-individual (Individual Dashboard)');
        }
      }
      
    } else {
      console.log('❌ No company user found');
      
      // List all users
      const allUsers = await User.find({ role: 'Recruiter' }).select('fullname email role recruiterType');
      console.log('📋 All recruiter users:', allUsers);
    }
    
  } catch (error) {
    console.error('❌ Error testing user login:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await testUserLogin();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
};

main().catch(console.error);
