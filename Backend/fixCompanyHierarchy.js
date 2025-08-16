import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Role } from './Models/role.model.js';
import { CompanyUser } from './Models/companyUser.model.js';
import { Company } from './Models/company.model.js';

// Load environment variables
dotenv.config();

const fixCompanyHierarchy = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all company users to analyze the hierarchy
        const companyUsers = await CompanyUser.find({}).populate('userId').populate('companyId');
        
        console.log(`Found ${companyUsers.length} company users to analyze`);

        for (const companyUser of companyUsers) {
            const user = companyUser.userId;
            const company = companyUser.companyId;
            
            console.log(`\n🔍 Analyzing: ${user.fullname} (${user.email}) in company: ${company.name}`);
            
            // Check if this user is the original company registrant
            // The company registrant should have the same email as the company contact email
            const isCompanyOwner = user.email === company.contact.email;
            
            if (isCompanyOwner) {
                console.log(`✅ ${user.fullname} is the Company Owner (registered the company)`);
                
                // Update user role to Company
                user.role = 'Company';
                user.cnic = undefined;
                await user.save();
                
                // Create or update Company Owner role
                let companyOwnerRole = await Role.findOne({
                    companyId: company._id,
                    roleType: 'COMPANY_OWNER'
                });

                if (!companyOwnerRole) {
                    companyOwnerRole = new Role({
                        name: 'Company Owner',
                        description: 'Full access within the company - can manage teams, roles, users, and company settings',
                        companyId: company._id,
                        roleType: 'COMPANY_OWNER',
                        level: 10,
                        color: '#DC2626',
                        createdBy: user._id,
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
                    console.log('✅ Created Company Owner role');
                }

                // Update CompanyUser record
                companyUser.roleId = companyOwnerRole._id;
                companyUser.status = "active";
                await companyUser.save();
                console.log('✅ Updated CompanyUser record with Company Owner role');

            } else {
                console.log(`👤 ${user.fullname} is a company employee (created by someone else)`);
                
                // This user should be a Manager (not Company Owner)
                user.role = 'Recruiter'; // Keep as Recruiter but with Manager role
                user.cnic = undefined;
                await user.save();
                
                // Create or update Manager role
                let managerRole = await Role.findOne({
                    companyId: company._id,
                    roleType: 'MANAGER'
                });

                if (!managerRole) {
                    managerRole = new Role({
                        name: 'Manager',
                        description: 'Can manage teams, projects, and users within the company',
                        companyId: company._id,
                        roleType: 'MANAGER',
                        level: 7,
                        color: '#2563EB',
                        createdBy: companyUser.userId._id, // The company owner
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
                    console.log('✅ Created Manager role');
                }

                // Update CompanyUser record
                companyUser.roleId = managerRole._id;
                companyUser.status = "active";
                await companyUser.save();
                console.log('✅ Updated CompanyUser record with Manager role');
            }
        }

        console.log('\n🎉 Company hierarchy has been properly fixed!');
        console.log('📋 Summary:');
        console.log('- Company Owners: Users who registered the company');
        console.log('- Managers: Users created by company owners');
        console.log('- Recruiters: Regular employees');

    } catch (error) {
        console.error('❌ Error fixing company hierarchy:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the fix function
fixCompanyHierarchy();
