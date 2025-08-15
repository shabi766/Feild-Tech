import mongoose from 'mongoose';
import { Company } from './Models/company.model.js';
import { User } from './Models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testCompanyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alpha_project');
    console.log('✅ Connected to MongoDB');

    // Check if companies exist
    const companies = await Company.find({}).select('name industry description recruiters address contact');
    console.log('\n📊 Companies found:', companies.length);
    
    if (companies.length > 0) {
      companies.forEach((company, index) => {
        console.log(`\n🏢 Company ${index + 1}:`);
        console.log('  Name:', company.name);
        console.log('  Industry:', company.industry);
        console.log('  Description:', company.description);
        console.log('  Recruiters:', company.recruiters?.length || 0);
        if (company.recruiters && company.recruiters.length > 0) {
          company.recruiters.forEach((recruiter, rIndex) => {
            console.log(`    Recruiter ${rIndex + 1}:`, {
              name: recruiter.name,
              email: recruiter.email,
              position: recruiter.position
            });
          });
        }
        console.log('  Address:', company.address ? 'Present' : 'Missing');
        console.log('  Contact:', company.contact ? 'Present' : 'Missing');
      });
    }

    // Check if users with companyId exist
    const companyUsers = await User.find({ companyId: { $exists: true } }).select('fullname email role recruiterType companyId');
    console.log('\n👥 Users with companyId found:', companyUsers.length);
    
    if (companyUsers.length > 0) {
      companyUsers.forEach((user, index) => {
        console.log(`\n👤 User ${index + 1}:`);
        console.log('  Name:', user.fullname);
        console.log('  Email:', user.email);
        console.log('  Role:', user.role);
        console.log('  Recruiter Type:', user.recruiterType);
        console.log('  Company ID:', user.companyId);
      });
    }

    // Check if there are any users with role "Recruiter" and recruiterType "Company"
    const companyRecruiters = await User.find({ 
      role: 'Recruiter', 
      recruiterType: 'Company' 
    }).select('fullname email companyId');
    
    console.log('\n🏢 Company Recruiters found:', companyRecruiters.length);
    if (companyRecruiters.length > 0) {
      companyRecruiters.forEach((user, index) => {
        console.log(`\n👤 Company Recruiter ${index + 1}:`);
        console.log('  Name:', user.fullname);
        console.log('  Email:', user.email);
        console.log('  Company ID:', user.companyId);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testCompanyData();

