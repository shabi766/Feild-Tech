import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './Models/company.model.js';

dotenv.config();

async function checkExistingCompanies() {
    try {
        // Connect to database
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/alpha_project";
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Find all companies
        const companies = await Company.find({});
        
        if (companies.length === 0) {
            console.log('📭 No companies found in database');
        } else {
            console.log(`📊 Found ${companies.length} company(ies):`);
            companies.forEach((company, index) => {
                console.log(`\n${index + 1}. Company: ${company.name}`);
                console.log(`   Email: ${company.contact?.email || 'N/A'}`);
                console.log(`   Status: ${company.status || 'N/A'}`);
                console.log(`   Created: ${company.createdAt?.toLocaleDateString() || 'N/A'}`);
                console.log(`   Full data:`, JSON.stringify(company, null, 2));
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the check
checkExistingCompanies();
