import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './Models/company.model.js';
import { User } from './Models/user.model.js';

dotenv.config();

// Test data
const testCompanyData = {
    companyName: "Test Company Inc",
    companyType: "Technology",
    industry: "Software Development",
    description: "A test company for development purposes",
    foundedYear: 2020,
    employeeCount: "11-50",
    annualRevenue: "$1M - $5M",
    companyEmail: "test@testcompany.com",
    companyPhone: "+1234567890",
    website: "https://testcompany.com",
    address: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        postalCode: "12345",
        country: "Test Country"
    },
    recruiterName: "John Test",
    recruiterEmail: "john@testcompany.com",
    recruiterPhone: "+1234567891",
    recruiterPosition: "HR Manager",
    password: "testpassword123"
};

async function testCompanyRegistration() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test company creation
        console.log('\n🧪 Testing Company Creation...');
        const company = new Company(testCompanyData);
        await company.save();
        console.log('✅ Company created successfully:', company._id);

        // Test user creation
        console.log('\n🧪 Testing User Creation...');
        const user = new User({
            fullname: testCompanyData.recruiterName,
            email: testCompanyData.recruiterEmail,
            phoneNumber: testCompanyData.recruiterPhone,
            password: testCompanyData.password,
            role: "Recruiter",
            recruiterType: "Company",
            companyId: company._id,
            profile: {
                company: company._id
            },
            profileCompleted: true
        });
        await user.save();
        console.log('✅ User created successfully:', user._id);

        // Test company retrieval
        console.log('\n🧪 Testing Company Retrieval...');
        const retrievedCompany = await Company.findById(company._id).select('-password');
        console.log('✅ Company retrieved successfully:', retrievedCompany.name);

        // Test user retrieval
        console.log('\n🧪 Testing User Retrieval...');
        const retrievedUser = await User.findById(user._id);
        console.log('✅ User retrieved successfully:', retrievedUser.fullname);

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Company.findByIdAndDelete(company._id);
        await User.findByIdAndDelete(user._id);
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 All tests passed! Company registration backend is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testCompanyRegistration();

