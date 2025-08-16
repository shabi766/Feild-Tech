import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Role } from './Models/role.model.js';
import { CompanyUser } from './Models/companyUser.model.js';
import { Company } from './Models/company.model.js';

// Load environment variables
dotenv.config();

const fixTargetCompany = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find the Target company
        const targetCompany = await Company.findOne({ name: 'Target' });
        if (!targetCompany) {
            console.log('❌ Target company not found');
            return;
        }

        console.log(`🏢 Fixing company: ${targetCompany.name} (${targetCompany.contact.email})`);

        // Find Ben (Ben@gmail.com) - he should be the Company Owner
        const benUser = await User.findOne({ email: 'Ben@gmail.com' });
        if (!benUser) {
            console.log('❌ Ben user not found');
            return;
        }

        console.log(`👤 Found Ben: ${benUser.fullname} (${benUser.email})`);

        // Update Ben to be Company Owner
        benUser.role = 'Company';
        benUser.cnic = undefined;
        await benUser.save();
        console.log('✅ Updated Ben to Company Owner role');

        // Create Company Owner role for Target company
        let companyOwnerRole = await Role.findOne({
            companyId: targetCompany._id,
            roleType: 'COMPANY_OWNER'
        });

        if (!companyOwnerRole) {
            companyOwnerRole = new Role({
                name: 'Company Owner',
                description: 'Full access within the company - can manage teams, roles, users, and company settings',
                companyId: targetCompany._id,
                roleType: 'COMPANY_OWNER',
                level: 10,
                color: '#DC2626',
                createdBy: benUser._id,
                permissions: {
                    canManageCompanySettings: true,
                    canManageAllUsers: true,
                    canManageAllRoles: true,
                    canManageAllTeams: true,
                    canAccessMainWallet: true,
                    canCreateSubWallets: true,
                    canTransferFunds: true,
                    canViewAllFinancials: true,
                    canCreateJobs: true,
                    canEditJobs: true,
                    canDeleteJobs: true,
                    canAssignJobs: true,
                    canViewAllJobs: true,
                    canHireTechnicians: true,
                    canPayTechnicians: true,
                    canViewAuditLogs: true,
                    canManageSystemSettings: true
                }
            });
            await companyOwnerRole.save();
            console.log('✅ Created Company Owner role for Target company');
        }

        // Update Ben's CompanyUser record
        let benCompanyUser = await CompanyUser.findOne({
            userId: benUser._id,
            companyId: targetCompany._id
        });

        if (benCompanyUser) {
            benCompanyUser.roleId = companyOwnerRole._id;
            benCompanyUser.status = "active";
            await benCompanyUser.save();
            console.log('✅ Updated Ben\'s CompanyUser record with Company Owner role');
        }

        // Find Sufyan - he should be Manager
        const sufyanUser = await User.findOne({ email: 'sufyan@gmail.com' });
        if (sufyanUser) {
            console.log(`👤 Found Sufyan: ${sufyanUser.fullname} (${sufyanUser.email})`);
            
            // Keep Sufyan as Recruiter but with Manager company role
            sufyanUser.role = 'Recruiter';
            sufyanUser.cnic = undefined;
            await sufyanUser.save();
            console.log('✅ Updated Sufyan to Recruiter role');

            // Create or update Manager role
            let managerRole = await Role.findOne({
                companyId: targetCompany._id,
                roleType: 'MANAGER'
            });

            if (!managerRole) {
                managerRole = new Role({
                    name: 'Manager',
                    description: 'Can manage teams, projects, and users within the company',
                    companyId: targetCompany._id,
                    roleType: 'MANAGER',
                    level: 7,
                    color: '#2563EB',
                    createdBy: benUser._id, // Ben is the company owner
                    permissions: {
                        canManageCompanySettings: false,
                        canManageAllUsers: true,
                        canManageAllRoles: false,
                        canManageAllTeams: true,
                        canAccessMainWallet: true,
                        canCreateSubWallets: true,
                        canTransferFunds: true,
                        canViewAllFinancials: true,
                        canCreateJobs: true,
                        canEditJobs: true,
                        canDeleteJobs: false,
                        canAssignJobs: true,
                        canViewAllJobs: true,
                        canHireTechnicians: true,
                        canPayTechnicians: true,
                        canViewAuditLogs: false,
                        canManageSystemSettings: false
                    }
                });
                await managerRole.save();
                console.log('✅ Created Manager role for Target company');
            }

            // Update Sufyan's CompanyUser record
            let sufyanCompanyUser = await CompanyUser.findOne({
                userId: sufyanUser._id,
                companyId: targetCompany._id
            });

            if (sufyanCompanyUser) {
                sufyanCompanyUser.roleId = managerRole._id;
                sufyanCompanyUser.status = "active";
                await sufyanCompanyUser.save();
                console.log('✅ Updated Sufyan\'s CompanyUser record with Manager role');
            }
        }

        console.log('\n🎉 Target company hierarchy has been properly fixed!');
        console.log('📋 Summary:');
        console.log('- Ben (Ben@gmail.com) = Company Owner of Target company');
        console.log('- Sufyan (sufyan@gmail.com) = Manager of Target company');

    } catch (error) {
        console.error('❌ Error fixing Target company:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the fix function
fixTargetCompany();
