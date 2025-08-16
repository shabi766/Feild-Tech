import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Company } from './Models/company.model.js';
import { Wallet } from './Models/wallet.model.js';

// Load environment variables
dotenv.config();

const createWalletsForExistingUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create wallets for individual users
        const individualUsers = await User.find({
            $or: [
                { role: 'Technician' },
                { role: 'Recruiter', recruiterType: 'Individual' }
            ]
        });

        console.log(`Found ${individualUsers.length} individual users to create wallets for`);

        for (const user of individualUsers) {
            // Check if wallet already exists
            const existingWallet = await Wallet.findOne({
                ownerId: user._id,
                ownerType: 'User',
                walletType: 'INDIVIDUAL'
            });

            if (!existingWallet) {
                const wallet = new Wallet({
                    ownerId: user._id,
                    ownerType: 'User',
                    walletType: 'INDIVIDUAL',
                    balance: 0,
                    currency: 'USD'
                });

                await wallet.save();
                console.log(`✅ Created wallet for ${user.fullname} (${user.email})`);
            } else {
                console.log(`ℹ️ Wallet already exists for ${user.fullname} (${user.email})`);
            }
        }

        // Create wallets for companies
        const companies = await Company.find({});

        console.log(`\nFound ${companies.length} companies to create wallets for`);

        for (const company of companies) {
            // Check if company wallet already exists
            const existingWallet = await Wallet.findOne({
                ownerId: company._id,
                ownerType: 'Company',
                walletType: 'COMPANY_MAIN'
            });

            if (!existingWallet) {
                const wallet = new Wallet({
                    ownerId: company._id,
                    ownerType: 'Company',
                    walletType: 'COMPANY_MAIN',
                    balance: 0,
                    currency: 'USD'
                });

                await wallet.save();
                console.log(`✅ Created wallet for company: ${company.name}`);
            } else {
                console.log(`ℹ️ Wallet already exists for company: ${company.name}`);
            }
        }

        // Create sub-wallets for company employees
        const companyUsers = await User.find({
            role: 'Recruiter',
            recruiterType: 'Company',
            companyId: { $exists: true }
        });

        console.log(`\nFound ${companyUsers.length} company employees to create sub-wallets for`);

        for (const user of companyUsers) {
            // Check if sub-wallet already exists
            const existingSubWallet = await Wallet.findOne({
                ownerId: user._id,
                ownerType: 'User',
                walletType: 'COMPANY_SUB',
                companyId: user.companyId
            });

            if (!existingSubWallet) {
                // Get company main wallet
                const companyWallet = await Wallet.findOne({
                    ownerId: user.companyId,
                    ownerType: 'Company',
                    walletType: 'COMPANY_MAIN'
                });

                if (companyWallet) {
                    const subWallet = new Wallet({
                        ownerId: user._id,
                        ownerType: 'User',
                        walletType: 'COMPANY_SUB',
                        companyId: user.companyId,
                        parentWalletId: companyWallet._id,
                        name: `${user.fullname}'s Wallet`,
                        description: 'Sub-wallet for company employee',
                        balance: 0,
                        currency: 'USD',
                        permissions: {
                            canWithdraw: false,
                            canTransfer: true,
                            maxTransferAmount: 0,
                            dailyTransferLimit: 0
                        }
                    });

                    await subWallet.save();
                    console.log(`✅ Created sub-wallet for ${user.fullname} (${user.email}) in company ${user.companyId}`);
                } else {
                    console.log(`⚠️ Company wallet not found for ${user.fullname} (${user.email})`);
                }
            } else {
                console.log(`ℹ️ Sub-wallet already exists for ${user.fullname} (${user.email})`);
            }
        }

        console.log('\n🎉 Wallet creation completed!');
        console.log('📋 Summary:');
        console.log('- Individual wallets created for Technicians and Individual Recruiters');
        console.log('- Company main wallets created for all companies');
        console.log('- Sub-wallets created for company employees');

    } catch (error) {
        console.error('❌ Error creating wallets:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the wallet creation function
createWalletsForExistingUsers();
