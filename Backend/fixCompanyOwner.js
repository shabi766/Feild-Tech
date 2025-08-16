import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Role } from './Models/role.model.js';
import { CompanyUser } from './Models/companyUser.model.js';

// Load environment variables
dotenv.config();

const fixCompanyOwner = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find users who registered companies but are marked as recruiters
        const companyRecruiters = await User.find({
            recruiterType: 'Company',
            role: 'Recruiter',
            companyId: { $exists: true }
        });

        console.log(`Found ${companyRecruiters.length} company recruiters to fix`);

        for (const user of companyRecruiters) {
            console.log(`\n🔧 Fixing user: ${user.fullname} (${user.email})`);
            
            // Update user role to Company (Company Owner)
            user.role = 'Company';
            // Remove CNIC requirement for company owners
            user.cnic = undefined;
            await user.save();
            console.log('✅ Updated user role to Company (Company Owner)');

            // Check if company owner role already exists for this company
            let companyOwnerRole = await Role.findOne({
                companyId: user.companyId,
                roleType: 'COMPANY_OWNER'
            });

            if (!companyOwnerRole) {
                // Create company owner role (not website admin)
                companyOwnerRole = new Role({
                    name: 'Company Owner',
                    description: 'Full access within the company - can manage teams, roles, users, and company settings',
                    companyId: user.companyId,
                    roleType: 'COMPANY_OWNER',
                    level: 10,
                    color: '#DC2626',
                    createdBy: user._id,
                    permissions: {
                        // Company Management
                        canManageCompanySettings: true,
                        canManageAllUsers: true,
                        canManageAllRoles: true,
                        canManageAllTeams: true,
                        
                        // Financial Access
                        canAccessMainWallet: true,
                        canCreateSubWallets: true,
                        canTransferFunds: true,
                        canViewAllFinancials: true,
                        
                        // Job Management
                        canCreateJobs: true,
                        canEditJobs: true,
                        canDeleteJobs: true,
                        canAssignJobs: true,
                        canViewAllJobs: true,
                        
                        // Hiring & Payments
                        canHireTechnicians: true,
                        canPayTechnicians: true,
                        
                        // System Access (within company only)
                        canViewAuditLogs: true,
                        canManageSystemSettings: true
                    }
                });
                await companyOwnerRole.save();
                console.log('✅ Created Company Owner role');
            } else {
                console.log('✅ Company Owner role already exists');
            }

            // Check if CompanyUser record exists
            let companyUser = await CompanyUser.findOne({
                userId: user._id,
                companyId: user.companyId
            });

            if (!companyUser) {
                // Create CompanyUser record
                companyUser = new CompanyUser({
                    userId: user._id,
                    companyId: user.companyId,
                    roleId: companyOwnerRole._id,
                    status: "active",
                    joinedAt: new Date(),
                    lastActive: new Date()
                });
                await companyUser.save();
                console.log('✅ Created CompanyUser record');
            } else {
                // Update existing CompanyUser record to have company owner role
                companyUser.roleId = companyOwnerRole._id;
                companyUser.status = "active";
                await companyUser.save();
                console.log('✅ Updated CompanyUser record with Company Owner role');
            }

            console.log(`✅ Successfully fixed ${user.fullname} to Company Owner`);
        }

        console.log('\n🎉 All company owners have been fixed!');

    } catch (error) {
        console.error('❌ Error fixing company owners:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the fix function
fixCompanyOwner();
