import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Role } from './Models/role.model.js';
import { CompanyUser } from './Models/companyUser.model.js';
import { Company } from './Models/company.model.js';

// Load environment variables
dotenv.config();

const checkCompanyData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check all companies
        const companies = await Company.find({});
        console.log(`\n📊 Found ${companies.length} companies:`);
        
        for (const company of companies) {
            console.log(`\n🏢 Company: ${company.name}`);
            console.log(`   Contact Email: ${company.contact?.email || 'N/A'}`);
            console.log(`   Contact Phone: ${company.contact?.phone || 'N/A'}`);
            console.log(`   Recruiters: ${company.recruiters?.length || 0}`);
            
            // Check company users
            const companyUsers = await CompanyUser.find({ companyId: company._id })
                .populate('userId')
                .populate('roleId');
            
            console.log(`   Company Users: ${companyUsers.length}`);
            
            for (const cu of companyUsers) {
                console.log(`     👤 ${cu.userId?.fullname || 'Unknown'} (${cu.userId?.email || 'Unknown'})`);
                console.log(`        Role: ${cu.userId?.role || 'Unknown'}`);
                console.log(`        Company Role: ${cu.roleId?.name || 'None'}`);
                console.log(`        Status: ${cu.status}`);
            }
        }

        // Check all users with companyId
        const companyUsers = await User.find({ companyId: { $exists: true } });
        console.log(`\n👥 Users with companyId: ${companyUsers.length}`);
        
        for (const user of companyUsers) {
            console.log(`   ${user.fullname} (${user.email}) - Role: ${user.role}, CompanyId: ${user.companyId}`);
        }

    } catch (error) {
        console.error('❌ Error checking company data:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the check function
checkCompanyData();
