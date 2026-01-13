import { CompanyUser } from "../Models/companyUser.model.js";
import { User } from "../Models/user.model.js";
import { Company } from "../Models/company.model.js";
import { Role } from "../Models/role.model.js";
import { Team } from "../Models/team.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Invite a new user to the company
export const inviteUserToCompany = async (req, res) => {
    try {
        console.log("🔍 Debug: inviteUserToCompany called");
        console.log("🔍 Debug: req.user:", req.user);
        console.log("🔍 Debug: req.companyUser:", req.companyUser);
        console.log("🔍 Debug: req.params:", req.params);
        console.log("🔍 Debug: req.body:", req.body);

        const { email, fullname, phoneNumber, roleId, teamIds, message } = req.body;
        const { companyId } = req.params;
        const invitedBy = req.user._id;

        // Validate required fields
        if (!email || !fullname || !phoneNumber || !roleId) {
            return res.status(400).json({
                success: false,
                message: "Email, fullname, phone number, and role are required"
            });
        }

        // Validate that the role exists and belongs to the company
        const role = await Role.findOne({
            _id: roleId,
            companyId: companyId,
            isActive: true
        });

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Invalid role selected"
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        let isNewUser = false;
        let tempPassword = null;

        if (!user) {
            // Create new user account with auto-generated credentials
            tempPassword = crypto.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = new User({
                fullname,
                email,
                phoneNumber,
                password: hashedPassword,
                role: "Recruiter",
                recruiterType: "Company",
                companyId,
                status: "offline"
            });

            await user.save();
            isNewUser = true;
            console.log("✅ Debug: New user created:", user._id);
        } else {
            // Check if user is already part of this company
            const existingCompanyUser = await CompanyUser.findOne({
                userId: user._id,
                companyId
            });

            if (existingCompanyUser) {
                return res.status(400).json({
                    success: false,
                    message: "User is already part of this company"
                });
            }
            console.log("✅ Debug: Existing user found:", user._id);
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create CompanyUser record
        const companyUser = new CompanyUser({
            userId: user._id,
            companyId,
            roleId: role._id, // Use the validated role ID
            teams: teamIds ? teamIds.map(teamId => ({ teamId })) : [],
            status: "pending",
            invitedBy,
            invitationToken,
            invitationExpires
        });

        await companyUser.save();
        console.log("✅ Debug: CompanyUser record created:", companyUser._id);

        // Add user to specified teams if any
        if (teamIds && teamIds.length > 0) {
            for (const teamId of teamIds) {
                const team = await Team.findById(teamId);
                if (team && team.companyId.toString() === companyId) {
                    team.members.push({
                        userId: user._id,
                        role: "Member",
                        isActive: true
                    });
                    await team.save();
                }
            }
        }

        // Prepare response with credentials for new users
        const responseData = {
            success: true,
            message: "User invited successfully",
            data: {
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                },
                companyUser: {
                    _id: companyUser._id,
                    status: companyUser.status,
                    invitedBy: companyUser.invitedBy,
                    invitationExpires: companyUser.invitationExpires
                },
                credentials: isNewUser ? {
                    email: user.email,
                    password: tempPassword,
                    loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
                } : null,
                invitationToken: isNewUser ? invitationToken : null,
                isNewUser,
                roleAssigned: role._id ? true : false
            }
        };

        console.log("✅ Debug: Invitation successful, sending response");
        res.status(201).json(responseData);

    } catch (error) {
        console.error("❌ Error inviting user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to invite user",
            error: error.message
        });
    }
};

// Accept company invitation
export const acceptCompanyInvitation = async (req, res) => {
    try {
        const { invitationToken } = req.body;

        if (!invitationToken) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required"
            });
        }

        // Find company user with valid invitation
        const companyUser = await CompanyUser.findOne({
            invitationToken,
            invitationExpires: { $gt: new Date() },
            status: "pending"
        }).populate('companyId').populate('roleId');

        if (!companyUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired invitation token"
            });
        }

        // Update company user status
        companyUser.status = "active";
        companyUser.invitationToken = undefined;
        companyUser.invitationExpires = undefined;
        companyUser.lastActive = new Date();
        await companyUser.save();

        res.status(200).json({
            success: true,
            message: "Invitation accepted successfully",
            data: {
                companyUser,
                company: companyUser.companyId,
                role: companyUser.roleId
            }
        });

    } catch (error) {
        console.error("Error accepting invitation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept invitation",
            error: error.message
        });
    }
};

// Get all company users
export const getCompanyUsers = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { page = 1, limit = 10, search, status, roleId, teamId } = req.query;

        const query = { companyId };

        if (status) {
            query.status = status;
        }

        if (roleId) {
            query.roleId = roleId;
        }

        if (teamId) {
            query["teams.teamId"] = teamId;
        }

        let companyUsers = await CompanyUser.find(query)
            .populate('userId', 'fullname email profile.profilePhoto phoneNumber')
            .populate('roleId', 'name color level')
            .populate('invitedBy', 'fullname email')
            .sort({ joinedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Apply search filter if provided
        if (search) {
            companyUsers = companyUsers.filter(cu =>
                cu.userId.fullname.toLowerCase().includes(search.toLowerCase()) ||
                cu.userId.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = await CompanyUser.countDocuments(query);

        res.status(200).json({
            success: true,
            data: companyUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching company users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch company users",
            error: error.message
        });
    }
};

// Get company user details
export const getCompanyUserDetails = async (req, res) => {
    try {
        const { companyId, userId } = req.params;

        const companyUser = await CompanyUser.findOne({ companyId, userId })
            .populate('userId', 'fullname email profile.profilePhoto phoneNumber')
            .populate('roleId', 'name color level permissions')
            .populate('invitedBy', 'fullname email')
            .populate('teams.teamId', 'name description color')
            .populate('companyId', 'name logo');

        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "Company user not found"
            });
        }

        res.status(200).json({
            success: true,
            data: companyUser
        });

    } catch (error) {
        console.error("Error fetching company user details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch company user details",
            error: error.message
        });
    }
};

// Update company user
export const updateCompanyUser = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const { roleId, status, teamIds, settings, permissions } = req.body;

        const companyUser = await CompanyUser.findOne({ companyId, userId });
        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "Company user not found"
            });
        }

        // Update fields
        if (roleId) companyUser.roleId = roleId;
        if (status) companyUser.status = status;
        if (teamIds !== undefined) {
            // Handle team assignments
            companyUser.teams = teamIds.map(teamId => ({ teamId }));

            // Update team memberships
            if (companyUser.teams && companyUser.teams.length > 0) {
                // Remove user from all existing teams
                if (companyUser.teams.length > 0) {
                    for (const teamInfo of companyUser.teams) {
                        await Team.findByIdAndUpdate(teamInfo.teamId, {
                            $pull: { members: { userId: userId } }
                        });
                    }
                }

                // Add user to new teams
                for (const teamId of teamIds) {
                    const team = await Team.findById(teamId);
                    if (team && team.companyId.toString() === companyId) {
                        team.members.push({
                            userId: userId,
                            role: "Member",
                            isActive: true
                        });
                        await team.save();
                    }
                }
            }
        }
        if (settings) companyUser.settings = { ...companyUser.settings, ...settings };
        if (permissions) companyUser.permissions = { ...companyUser.permissions, ...permissions };

        companyUser.lastActive = new Date();
        await companyUser.save();

        const updatedCompanyUser = await CompanyUser.findOne({ companyId, userId })
            .populate('userId', 'fullname email profile.profilePhoto phoneNumber')
            .populate('roleId', 'name color level permissions')
            .populate('teams.teamId', 'name description color')
            .populate('invitedBy', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Company user updated successfully",
            data: updatedCompanyUser
        });

    } catch (error) {
        console.error("Error updating company user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update company user",
            error: error.message
        });
    }
};

// Remove user from company
export const removeUserFromCompany = async (req, res) => {
    try {
        const { companyId, userId } = req.params;

        const companyUser = await CompanyUser.findOne({ companyId, userId });
        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "Company user not found"
            });
        }

        // Remove user from all teams
        if (companyUser.teams && companyUser.teams.length > 0) {
            for (const teamInfo of companyUser.teams) {
                await Team.findByIdAndUpdate(teamInfo.teamId, {
                    $pull: { members: { userId: userId } }
                });
            }
        }

        // Remove company user record
        await CompanyUser.findByIdAndDelete(companyUser._id);

        res.status(200).json({
            success: true,
            message: "User removed from company successfully"
        });

    } catch (error) {
        console.error("Error removing user from company:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove user from company",
            error: error.message
        });
    }
};

// Resend invitation
export const resendInvitation = async (req, res) => {
    try {
        const { companyId, userId } = req.params;

        const companyUser = await CompanyUser.findOne({ companyId, userId });
        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "Company user not found"
            });
        }

        if (companyUser.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "User is not in pending status"
            });
        }

        // Generate new invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        companyUser.invitationToken = invitationToken;
        companyUser.invitationExpires = invitationExpires;
        await companyUser.save();

        // TODO: Send new invitation email
        res.status(200).json({
            success: true,
            message: "Invitation resent successfully",
            data: {
                invitationToken,
                invitationExpires
            }
        });

    } catch (error) {
        console.error("Error resending invitation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to resend invitation",
            error: error.message
        });
    }
};

// Get user's company memberships
export const getUserCompanyMemberships = async (req, res) => {
    try {
        const userId = req.user._id;

        const companyUsers = await CompanyUser.find({ userId })
            .populate('companyId', 'name logo industry')
            .populate('roleId', 'name color level')
            .populate('teams.teamId', 'name description color')
            .sort({ joinedAt: -1 });

        res.status(200).json({
            success: true,
            data: companyUsers
        });

    } catch (error) {
        console.error("Error fetching user company memberships:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch company memberships",
            error: error.message
        });
    }
};

// Bulk invite users
export const bulkInviteUsers = async (req, res) => {
    try {
        const { users, autoAssignRecruiterRole = true } = req.body;
        const { companyId } = req.params;
        const invitedBy = req.user._id;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Users array is required and must not be empty"
            });
        }

        // Find or create default recruiter role if auto-assignment is enabled
        let defaultRecruiterRole = null;
        if (autoAssignRecruiterRole) {
            defaultRecruiterRole = await Role.findOne({
                companyId,
                name: { $regex: /^recruiter$/i },
                isActive: true
            });

            if (!defaultRecruiterRole) {
                // Create default recruiter role if it doesn't exist
                defaultRecruiterRole = new Role({
                    name: "Recruiter",
                    description: "Company recruiter with access to hiring and job management",
                    companyId,
                    createdBy: invitedBy,
                    level: 3,
                    color: "#6B7280",
                    permissions: {
                        canCreateJobs: true,
                        canEditJobs: true,
                        canDeleteJobs: false,
                        canAssignJobs: true,
                        canViewAllJobs: true,
                        canCreateTeams: false,
                        canEditTeams: false,
                        canDeleteTeams: false,
                        canManageTeamMembers: false,
                        canInviteUsers: false,
                        canRemoveUsers: false,
                        canCreateProjects: false,
                        canEditProjects: false,
                        canDeleteProjects: false,
                        canAssignProjects: false,
                        canViewAllProjects: false,
                        canCreateClients: true,
                        canEditClients: true,
                        canDeleteClients: false,
                        canViewAllClients: true,
                        canViewBudget: false,
                        canManageBudget: false,
                        canViewInvoices: false,
                        canCreateInvoices: false,
                        canApprovePayments: false,
                        canViewReports: true,
                        canGenerateReports: false,
                        canExportData: false,
                        canViewUsers: false,
                        canEditUsers: false,
                        canDeleteUsers: false,
                        canChangeUserRoles: false,
                        canManageCompanySettings: false,
                        canManageIntegrations: false,
                        canViewAuditLogs: false
                    }
                });
                await defaultRecruiterRole.save();
            }
        }

        const results = [];
        const errors = [];

        for (const userData of users) {
            try {
                const { email, fullname, phoneNumber, roleId, teamIds } = userData;

                if (!email || !fullname || !phoneNumber) {
                    errors.push({ email, error: "Missing required fields" });
                    continue;
                }

                // Check if user already exists
                let user = await User.findOne({ email });
                let isNewUser = false;
                let tempPassword = null;

                if (!user) {
                    // Create new user account
                    tempPassword = crypto.randomBytes(8).toString('hex');
                    const hashedPassword = await bcrypt.hash(tempPassword, 10);

                    user = new User({
                        fullname,
                        email,
                        phoneNumber,
                        password: hashedPassword,
                        role: "Recruiter",
                        recruiterType: "Company",
                        companyId,
                        status: "offline"
                    });

                    await user.save();
                    isNewUser = true;
                } else {
                    // Check if user is already part of this company
                    const existingCompanyUser = await CompanyUser.findOne({
                        userId: user._id,
                        companyId
                    });

                    if (existingCompanyUser) {
                        errors.push({ email, error: "User already part of company" });
                        continue;
                    }
                }

                // Auto-assign recruiter role if requested and no specific role provided
                let finalRoleId = roleId;
                if (autoAssignRecruiterRole && !roleId && defaultRecruiterRole) {
                    finalRoleId = defaultRecruiterRole._id;
                }

                // Generate invitation token
                const invitationToken = crypto.randomBytes(32).toString('hex');
                const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                // Create CompanyUser record
                const companyUser = new CompanyUser({
                    userId: user._id,
                    companyId,
                    roleId: finalRoleId,
                    teams: teamIds ? teamIds.map(teamId => ({ teamId })) : [],
                    status: "pending",
                    invitedBy,
                    invitationToken,
                    invitationExpires
                });

                await companyUser.save();

                // Add user to specified teams if any
                if (teamIds && teamIds.length > 0) {
                    for (const teamId of teamIds) {
                        const team = await Team.findById(teamId);
                        if (team && team.companyId.toString() === companyId) {
                            team.members.push({
                                userId: user._id,
                                role: "Member",
                                isActive: true
                            });
                            await team.save();
                        }
                    }
                }

                results.push({
                    email,
                    fullname,
                    isNewUser,
                    credentials: isNewUser ? {
                        email: user.email,
                        password: tempPassword,
                        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
                    } : null,
                    invitationToken: isNewUser ? invitationToken : null,
                    roleAssigned: finalRoleId ? true : false
                });

            } catch (error) {
                errors.push({ email: userData.email, error: error.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk invitation completed. ${results.length} successful, ${errors.length} failed.`,
            data: {
                successful: results,
                errors: errors,
                defaultRoleCreated: defaultRecruiterRole ? true : false
            }
        });

    } catch (error) {
        console.error("Error in bulk invite:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process bulk invitations",
            error: error.message
        });
    }
};

// Auto-create admin role for company owners
export const ensureCompanyOwnerHasAdminRole = async (req, res) => {
    try {
        const { companyId } = req.params;
        const userId = req.user._id;

        // Check if user is a company owner
        const user = await User.findById(userId);
        if (!user || (user.role !== 'Company' && user.recruiterType !== 'Company')) {
            return res.status(403).json({
                success: false,
                message: "Only company owners can perform this action"
            });
        }

        // Check if admin role already exists
        const adminRoleExists = await Role.findOne({
            companyId,
            roleType: 'ADMIN',
            isActive: true
        });

        if (adminRoleExists) {
            return res.status(200).json({
                success: true,
                message: "Admin role already exists",
                data: adminRoleExists
            });
        }

        // Create admin role
        const adminRole = new Role({
            name: 'Admin',
            description: 'Full system access for company owners',
            companyId,
            roleType: 'ADMIN',
            level: 10,
            color: '#DC2626',
            createdBy: userId,
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

        await adminRole.save();

        // Assign admin role to the company owner
        await CompanyUser.findOneAndUpdate(
            { userId, companyId },
            {
                roleId: adminRole._id,
                status: "active",
                lastActive: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(201).json({
            success: true,
            message: "Admin role created and assigned successfully",
            data: adminRole
        });

    } catch (error) {
        console.error("Error creating admin role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create admin role",
            error: error.message
        });
    }
};
