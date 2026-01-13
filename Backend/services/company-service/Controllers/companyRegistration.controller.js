import { Company } from "../Models/company.model.js";
import { User } from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getKafkaProducer, CompanyCreatedEvent, TOPICS } from '../../shared-kafka/index.js';

// Company Registration with Authentication
export const registerCompany = async (req, res) => {
    try {
        const {
            companyName,
            companyType,
            industry,
            description,
            foundedYear,
            employeeCount,
            annualRevenue,
            companyEmail,
            companyPhone,
            website,
            address,
            recruiterName,
            recruiterEmail,
            recruiterPhone,
            recruiterPosition,
            password,
            businessLicense,
            taxId,
            companyRegistration
        } = req.body;

        // Validation
        if (!companyName || !companyType || !industry || !companyEmail || !companyPhone || !password) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false
            });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({
            $or: [
                { name: companyName },
                { 'contact.email': companyEmail }
            ]
        });

        if (existingCompany) {
            return res.status(400).json({
                message: "Company with this name or email already exists",
                success: false
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create company
        const company = new Company({
            name: companyName,
            companyType,
            industry,
            description,
            foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
            employeeCount,
            annualRevenue,
            contact: {
                email: companyEmail,
                phone: companyPhone,
                website
            },
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country
            },
            recruiters: [{
                name: recruiterName,
                email: recruiterEmail,
                phone: recruiterPhone,
                position: recruiterPosition,
                isPrimary: true
            }],
            password: hashedPassword,
            businessLicense,
            taxId,
            companyRegistration
        });

        await company.save();
        console.log('Company saved successfully:', company._id);

        // Validate required fields for user creation
        if (!recruiterName || !recruiterEmail || !recruiterPhone) {
            throw new Error('Missing required recruiter information');
        }

        // Create user account for the primary recruiter (Company Owner)
        console.log('Creating company owner with data:', {
            fullname: recruiterName,
            email: recruiterEmail,
            phoneNumber: recruiterPhone,
            role: "Company", // Changed from "Recruiter" to "Company"
            recruiterType: "Company",
            companyId: company._id
        });

        const user = new User({
            fullname: recruiterName,
            email: recruiterEmail,
            phoneNumber: recruiterPhone,
            password: hashedPassword,
            role: "Company", // Changed from "Recruiter" to "Company" - This makes them the company owner
            recruiterType: "Company",
            companyId: company._id,
            profile: {
                company: company._id
            },
            profileCompleted: true,
            // Set default values for company owners
            status: "online",
            lastSeen: new Date(),
            kyc: {
                kycStatus: 'unverified'
            },
            settings: {
                language: 'en',
                currency: 'USD',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                weekStart: 'monday'
            },
            privacy: {
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowMessages: true,
                showOnlineStatus: true,
                showLastSeen: true
            },
            notificationPreferences: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                marketingEmails: false,
                jobAlerts: true,
                messageAlerts: true,
                projectUpdates: true,
                paymentNotifications: true
            }
        });

        await user.save();

        // Import Role and CompanyUser models for automatic company owner role creation
        const { Role } = await import("../Models/role.model.js");
        const { CompanyUser } = await import("../Models/companyUser.model.js");

        // Automatically create Company Owner role for the company
        const companyOwnerRole = new Role({
            name: 'Company Owner',
            description: 'Full access within the company - can manage teams, roles, users, and company settings',
            companyId: company._id,
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

        // Create CompanyUser record linking the owner to the company with Company Owner role
        const companyUser = new CompanyUser({
            userId: user._id,
            companyId: company._id,
            roleId: companyOwnerRole._id,
            status: "active",
            joinedAt: new Date(),
            lastActive: new Date()
        });

        await companyUser.save();

        console.log('✅ Company Owner role and CompanyUser record created for company owner');

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                companyId: company._id,
                role: user.role, // "Company" - indicates company owner
                recruiterType: user.recruiterType,
                companyOwnerRoleId: companyOwnerRole._id, // Include company owner role ID
                isCompanyOwner: true // Flag to indicate company ownership
            },
            process.env.SECRET_KEY || 'fallback_secret_key_for_development',
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "Company registered successfully",
            success: true,
            data: {
                company: {
                    _id: company._id,
                    name: company.name,
                    companyType: company.companyType,
                    industry: company.industry,
                    status: company.status
                },
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role, // "Company" - indicates company owner
                    recruiterType: user.recruiterType,
                    companyId: company._id,
                    isCompanyOwner: true,
                    companyOwnerRoleId: companyOwnerRole._id
                },
                token
            }
        });

    } catch (error) {
        console.error("Error registering company:", error);
        return res.status(500).json({
            message: "An error occurred while registering the company",
            success: false,
            error: error.message
        });
    }
};

// Company Login
export const companyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false
            });
        }

        // Find company by email
        const company = await Company.findOne({ 'contact.email': email });
        if (!company) {
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, company.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
                success: false
            });
        }

        // Find or create user account
        let user = await User.findOne({ email });
        if (!user) {
            const primaryRecruiter = company.recruiters.find(r => r.isPrimary);
            user = new User({
                fullname: primaryRecruiter.name,
                email: primaryRecruiter.email,
                phoneNumber: primaryRecruiter.phone,
                password: company.password,
                role: "Recruiter",
                recruiterType: "Company",
                companyId: company._id,
                profile: {
                    company: company._id
                },
                profileCompleted: true,
                // Set default values for company recruiters
                status: "online",
                lastSeen: new Date(),
                kyc: {
                    kycStatus: 'unverified'
                },
                settings: {
                    language: 'en',
                    currency: 'USD',
                    timezone: 'UTC',
                    dateFormat: 'MM/DD/YYYY',
                    timeFormat: '12h',
                    weekStart: 'monday'
                },
                privacy: {
                    profileVisibility: 'public',
                    showEmail: false,
                    showPhone: false,
                    allowMessages: true,
                    showOnlineStatus: true,
                    showLastSeen: true
                },
                notificationPreferences: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: false,
                    marketingEmails: false,
                    jobAlerts: true,
                    messageAlerts: true,
                    projectUpdates: true,
                    paymentNotifications: true
                }
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                companyId: company._id,
                role: user.role,
                recruiterType: user.recruiterType
            },
            process.env.SECRET_KEY || 'fallback_secret_key_for_development',
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            data: {
                company: {
                    _id: company._id,
                    name: company.name,
                    companyType: company.companyType,
                    industry: company.industry,
                    status: company.status
                },
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    role: user.role,
                    recruiterType: user.recruiterType,
                    companyId: company._id
                },
                token
            }
        });

    } catch (error) {
        console.error("Error during company login:", error);
        return res.status(500).json({
            message: "An error occurred during login",
            success: false,
            error: error.message
        });
    }
};

// Get Company Profile
export const getCompanyProfile = async (req, res) => {
    try {
        const companyId = req.params.id || req.user.companyId;

        if (!companyId) {
            return res.status(400).json({
                message: "Company ID is required",
                success: false
            });
        }

        const company = await Company.findById(companyId).select('-password');
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company profile retrieved successfully",
            success: true,
            data: company
        });

    } catch (error) {
        console.error("Error getting company profile:", error);
        return res.status(500).json({
            message: "An error occurred while retrieving company profile",
            success: false,
            error: error.message
        });
    }
};

// Update Company Profile
export const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.params.id || req.user.companyId;
        const updateData = req.body;

        // Remove sensitive fields from update
        delete updateData.password;
        delete updateData.status;
        delete updateData.isVerified;

        const company = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Company profile updated successfully",
            success: true,
            data: company
        });

    } catch (error) {
        console.error("Error updating company profile:", error);
        return res.status(500).json({
            message: "An error occurred while updating company profile",
            success: false,
            error: error.message
        });
    }
};

// Change Company Password
export const changeCompanyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const companyId = req.user.companyId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
                success: false
            });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, company.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                message: "Current password is incorrect",
                success: false
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        company.password = hashedNewPassword;
        await company.save();

        return res.status(200).json({
            message: "Password changed successfully",
            success: true
        });

    } catch (error) {
        console.error("Error changing company password:", error);
        return res.status(500).json({
            message: "An error occurred while changing password",
            success: false,
            error: error.message
        });
    }
};
