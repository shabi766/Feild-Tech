import { Role } from "../Models/role.model.js";
import { CompanyUser } from "../Models/companyUser.model.js";
import { User } from "../Models/user.model.js";
import { Company } from "../Models/company.model.js";

// Create a new role
export const createRole = async (req, res) => {
    try {
        const { name, description, permissions, level, color, roleType } = req.body;
        const { companyId } = req.params;
        const createdBy = req.user._id;

        // Validate required fields
        if (!name || !companyId) {
            return res.status(400).json({
                success: false,
                message: "Role name and company ID are required"
            });
        }

        // Check if role name already exists in the company
        const existingRole = await Role.findOne({
            companyId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isActive: true
        });

        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: "A role with this name already exists in your company"
            });
        }

        // Handle predefined role types
        let finalPermissions = permissions || {};
        let finalLevel = level || 1;
        let finalColor = color || "#6B7280";

        if (roleType) {
            switch (roleType.toUpperCase()) {
                case 'ADMIN':
                    finalLevel = 10;
                    finalColor = "#DC2626";
                    finalPermissions = {
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
                    };
                    break;
                case 'MANAGER':
                    finalLevel = 7;
                    finalColor = "#2563EB";
                    finalPermissions = {
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
                    };
                    break;
                case 'RECRUITER':
                    finalLevel = 4;
                    finalColor = "#059669";
                    finalPermissions = {
                        canManageCompanySettings: false,
                        canManageAllUsers: false,
                        canManageAllRoles: false,
                        canManageAllTeams: false,
                        canAccessMainWallet: false,
                        canCreateSubWallets: false,
                        canTransferFunds: false,
                        canViewAllFinancials: false,
                        canCreateJobs: true,
                        canEditJobs: true,
                        canDeleteJobs: false,
                        canAssignJobs: true,
                        canViewAllJobs: false,
                        canHireTechnicians: true,
                        canPayTechnicians: true,
                        canViewAuditLogs: false,
                        canManageSystemSettings: false
                    };
                    break;
                default:
                    // Custom role - use provided permissions
                    break;
            }
        }

        // Create the role
        const role = new Role({
            name,
            description,
            companyId,
            createdBy,
            permissions: finalPermissions,
            level: finalLevel,
            color: finalColor,
            roleType: roleType || 'CUSTOM'
        });

        await role.save();

        const populatedRole = await Role.findById(role._id)
            .populate('createdBy', 'fullname email');

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: populatedRole
        });

    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create role",
            error: error.message
        });
    }
};

// Get all roles for a company
export const getCompanyRoles = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { page = 1, limit = 10, search, status } = req.query;

        const query = { companyId, isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const roles = await Role.find(query)
            .populate('createdBy', 'fullname email')
            .sort({ level: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Role.countDocuments(query);

        res.status(200).json({
            success: true,
            data: roles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRoles: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch roles",
            error: error.message
        });
    }
};

// Get role details
export const getRoleDetails = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findById(roleId)
            .populate('createdBy', 'fullname email')
            .populate('companyId', 'name logo');

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });

    } catch (error) {
        console.error("Error fetching role details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch role details",
            error: error.message
        });
    }
};

// Update role
export const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name, description, permissions, level, color, roleType } = req.body;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Check if user has permission to edit this role
        // Only company managers or role creators can edit roles
        if (role.createdBy.toString() !== req.user._id.toString()) {
            // Check if user is a company manager
            const companyUser = await CompanyUser.findOne({
                userId: req.user._id,
                companyId: role.companyId,
                status: "active"
            });

            if (!companyUser || companyUser.roleId.level < 7) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to edit this role"
                });
            }
        }

        // Handle predefined role types
        let finalPermissions = permissions || role.permissions;
        let finalLevel = level || role.level;
        let finalColor = color || role.color;

        if (roleType && roleType !== role.roleType) {
            switch (roleType.toUpperCase()) {
                case 'ADMIN':
                    finalLevel = 10;
                    finalColor = "#DC2626";
                    finalPermissions = {
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
                    };
                    break;
                case 'MANAGER':
                    finalLevel = 7;
                    finalColor = "#2563EB";
                    finalPermissions = {
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
                    };
                    break;
                case 'RECRUITER':
                    finalLevel = 4;
                    finalColor = "#059669";
                    finalPermissions = {
                        canManageCompanySettings: false,
                        canManageAllUsers: false,
                        canManageAllRoles: false,
                        canManageAllTeams: false,
                        canAccessMainWallet: false,
                        canCreateSubWallets: false,
                        canTransferFunds: false,
                        canViewAllFinancials: false,
                        canCreateJobs: true,
                        canEditJobs: true,
                        canDeleteJobs: false,
                        canAssignJobs: true,
                        canViewAllJobs: false,
                        canHireTechnicians: true,
                        canPayTechnicians: true,
                        canViewAuditLogs: false,
                        canManageSystemSettings: false
                    };
                    break;
                default:
                    // Custom role - use provided permissions
                    break;
            }
        }

        // Update role fields
        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions) role.permissions = { ...role.permissions, ...permissions };
        if (level) role.level = level;
        if (color) role.color = color;
        if (roleType) role.roleType = roleType;

        // Apply final values
        role.permissions = finalPermissions;
        role.level = finalLevel;
        role.color = finalColor;

        await role.save();

        const updatedRole = await Role.findById(roleId)
            .populate('createdBy', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: updatedRole
        });

    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update role",
            error: error.message
        });
    }
};

// Delete role
export const deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        // Check if user has permission to delete this role
        if (role.createdBy.toString() !== req.user._id.toString()) {
            // Check if user is a company manager
            const companyUser = await CompanyUser.findOne({
                userId: req.user._id,
                companyId: role.companyId,
                status: "active"
            });

            if (!companyUser || companyUser.roleId.level < 7) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to delete this role"
                });
            }
        }

        // Check if role is being used by any users
        const usersWithRole = await CompanyUser.countDocuments({
            roleId: roleId,
            status: "active"
        });

        if (usersWithRole > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role. ${usersWithRole} user(s) are currently assigned to this role.`
            });
        }

        // Soft delete the role
        role.isActive = false;
        await role.save();

        res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete role",
            error: error.message
        });
    }
};

// Assign role to user
export const assignRoleToUser = async (req, res) => {
    try {
        const { companyId, userId } = req.params;
        const { roleId } = req.body;

        // Validate required fields
        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: "Role ID is required"
            });
        }

        // Check if role exists and is active
        const role = await Role.findOne({
            _id: roleId,
            companyId: companyId,
            isActive: true
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found or inactive"
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update or create CompanyUser document
        const companyUser = await CompanyUser.findOneAndUpdate(
            { userId, companyId },
            { 
                roleId,
                status: "active",
                lastActive: new Date()
            },
            { upsert: true, new: true }
        ).populate('roleId');

        res.status(200).json({
            success: true,
            message: "Role assigned successfully",
            data: companyUser
        });

    } catch (error) {
        console.error("Error assigning role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign role",
            error: error.message
        });
    }
};

// Remove role from user
export const removeRoleFromUser = async (req, res) => {
    try {
        const { companyId, userId } = req.params;

        // Find and update CompanyUser document
        const companyUser = await CompanyUser.findOneAndUpdate(
            { userId, companyId },
            { 
                $unset: { roleId: 1 },
                status: "inactive"
            },
            { new: true }
        );

        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "User not found in company"
            });
        }

        res.status(200).json({
            success: true,
            message: "Role removed successfully",
            data: companyUser
        });

    } catch (error) {
        console.error("Error removing role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove role",
            error: error.message
        });
    }
};

// Get users with a specific role
export const getUsersWithRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const query = { roleId, isActive: true };

        if (status) {
            query.status = status;
        }

        const companyUsers = await CompanyUser.find(query)
            .populate('userId', 'fullname email profile.profilePhoto')
            .populate('roleId', 'name color')
            .populate('companyId', 'name logo')
            .sort({ joinedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

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
        console.error("Error fetching users with role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users with role",
            error: error.message
        });
    }
};

// Create default roles for a company
export const createDefaultRoles = async (req, res) => {
    try {
        const { companyId } = req.params;
        const createdBy = req.user._id;

        // Check if default roles already exist
        const existingRoles = await Role.countDocuments({ companyId });
        if (existingRoles > 0) {
            return res.status(400).json({
                success: false,
                message: "Default roles already exist for this company"
            });
        }

        // Create default roles
        const defaultRoles = [
            {
                name: "Company Owner",
                description: "Full access to all company features and settings",
                companyId,
                createdBy,
                level: 10,
                color: "#DC2626",
                permissions: {
                    canCreateJobs: true,
                    canEditJobs: true,
                    canDeleteJobs: true,
                    canAssignJobs: true,
                    canViewAllJobs: true,
                    canCreateTeams: true,
                    canEditTeams: true,
                    canDeleteTeams: true,
                    canManageTeamMembers: true,
                    canInviteUsers: true,
                    canRemoveUsers: true,
                    canCreateProjects: true,
                    canEditProjects: true,
                    canDeleteProjects: true,
                    canAssignProjects: true,
                    canViewAllProjects: true,
                    canCreateClients: true,
                    canEditClients: true,
                    canDeleteClients: true,
                    canViewAllClients: true,
                    canViewBudget: true,
                    canManageBudget: true,
                    canViewInvoices: true,
                    canCreateInvoices: true,
                    canApprovePayments: true,
                    canViewReports: true,
                    canGenerateReports: true,
                    canExportData: true,
                    canViewUsers: true,
                    canEditUsers: true,
                    canDeleteUsers: true,
                    canChangeUserRoles: true,
                    canManageCompanySettings: true,
                    canManageIntegrations: true,
                    canViewAuditLogs: true
                }
            },
            {
                name: "Manager",
                description: "Can manage teams, projects, and users",
                companyId,
                createdBy,
                level: 7,
                color: "#2563EB",
                permissions: {
                    canCreateJobs: true,
                    canEditJobs: true,
                    canDeleteJobs: false,
                    canAssignJobs: true,
                    canViewAllJobs: true,
                    canCreateTeams: true,
                    canEditTeams: true,
                    canDeleteTeams: false,
                    canManageTeamMembers: true,
                    canInviteUsers: true,
                    canRemoveUsers: true,
                    canCreateProjects: true,
                    canEditProjects: true,
                    canDeleteProjects: false,
                    canAssignProjects: true,
                    canViewAllProjects: true,
                    canCreateClients: true,
                    canEditClients: true,
                    canDeleteClients: false,
                    canViewAllClients: true,
                    canViewBudget: true,
                    canManageBudget: false,
                    canViewInvoices: true,
                    canCreateInvoices: false,
                    canApprovePayments: false,
                    canViewReports: true,
                    canGenerateReports: true,
                    canExportData: true,
                    canViewUsers: true,
                    canEditUsers: true,
                    canDeleteUsers: false,
                    canChangeUserRoles: true,
                    canManageCompanySettings: false,
                    canManageIntegrations: false,
                    canViewAuditLogs: true
                }
            },
            {
                name: "Team Lead",
                description: "Can manage team members and assigned projects",
                companyId,
                createdBy,
                level: 5,
                color: "#059669",
                permissions: {
                    canCreateJobs: true,
                    canEditJobs: true,
                    canDeleteJobs: false,
                    canAssignJobs: true,
                    canViewAllJobs: false,
                    canCreateTeams: false,
                    canEditTeams: false,
                    canDeleteTeams: false,
                    canManageTeamMembers: true,
                    canInviteUsers: false,
                    canRemoveUsers: false,
                    canCreateProjects: false,
                    canEditProjects: true,
                    canDeleteProjects: false,
                    canAssignProjects: true,
                    canViewAllProjects: false,
                    canCreateClients: false,
                    canEditClients: false,
                    canDeleteClients: false,
                    canViewAllClients: false,
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
            },
            {
                name: "Member",
                description: "Standard team member with basic permissions",
                companyId,
                createdBy,
                level: 3,
                color: "#6B7280",
                permissions: {
                    canCreateJobs: false,
                    canEditJobs: false,
                    canDeleteJobs: false,
                    canAssignJobs: false,
                    canViewAllJobs: false,
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
                    canCreateClients: false,
                    canEditClients: false,
                    canDeleteClients: false,
                    canViewAllClients: false,
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
            },
            {
                name: "Viewer",
                description: "Read-only access to assigned content",
                companyId,
                createdBy,
                level: 1,
                color: "#9CA3AF",
                permissions: {
                    canCreateJobs: false,
                    canEditJobs: false,
                    canDeleteJobs: false,
                    canAssignJobs: false,
                    canViewAllJobs: false,
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
                    canCreateClients: false,
                    canEditClients: false,
                    canDeleteClients: false,
                    canViewAllClients: false,
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
            }
        ];

        const createdRoles = await Role.insertMany(defaultRoles);

        res.status(201).json({
            success: true,
            message: "Default roles created successfully",
            data: createdRoles
        });

    } catch (error) {
        console.error("Error creating default roles:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create default roles",
            error: error.message
        });
    }
};

