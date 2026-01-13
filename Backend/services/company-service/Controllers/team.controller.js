import { Team } from "../Models/team.model.js";
import { CompanyUser } from "../Models/companyUser.model.js";
import { Role } from "../Models/role.model.js";
import { User } from "../Models/user.model.js";
import { Company } from "../Models/company.model.js";
import { auditMiddleware } from "../../../middleware/auditMiddleware.js";
import crypto from "crypto";

// Create a new team
export const createTeam = async (req, res) => {
    try {
        const { name, description, maxMembers, settings, tags, color } = req.body;
        const { companyId } = req.params;
        const createdBy = req.user._id;

        // Validate required fields
        if (!name || !companyId) {
            return res.status(400).json({
                success: false,
                message: "Team name and company ID are required"
            });
        }

        // Check if team name already exists in the company
        const existingTeam = await Team.findOne({
            companyId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isActive: true
        });

        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: "A team with this name already exists in your company"
            });
        }

        // Create the team
        const team = new Team({
            name,
            description,
            companyId,
            createdBy,
            maxMembers: maxMembers || 50,
            settings: settings || {},
            tags: tags || [],
            color: color || "#3B82F6"
        });

        // Add creator as team manager
        team.members.push({
            userId: createdBy,
            role: "Manager",
            permissions: {
                canCreateJobs: true,
                canAssignJobs: true,
                canManageTeam: true,
                canViewReports: true,
                canManageProjects: true,
                canManageClients: true,
                canManageBudget: true,
                canInviteUsers: true
            }
        });

        await team.save();

        // Update CompanyUser document to include team membership
        await CompanyUser.findOneAndUpdate(
            { userId: createdBy, companyId },
            { $push: { teams: { teamId: team._id, role: "Manager" } } },
            { upsert: true }
        );

        // Populate team details
        const populatedTeam = await Team.findById(team._id)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: populatedTeam
        });

    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create team",
            error: error.message
        });
    }
};

// Get all teams for a company
export const getCompanyTeams = async (req, res) => {
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

        const teams = await Team.find(query)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Team.countDocuments(query);

        res.status(200).json({
            success: true,
            data: teams,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTeams: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch teams",
            error: error.message
        });
    }
};

// Get team details
export const getTeamDetails = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId)
            .populate('members.userId', 'fullname email profile.profilePhoto phoneNumber')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email')
            .populate('companyId', 'name logo');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });

    } catch (error) {
        console.error("Error fetching team details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch team details",
            error: error.message
        });
    }
};

// Update team
export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description, maxMembers, settings, tags, color, teamLead } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if user has permission to edit this team
        const userMember = team.members.find(member =>
            member.userId.toString() === req.user._id.toString() &&
            (member.role === "Manager" || member.permissions.canManageTeam)
        );

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to edit this team"
            });
        }

        // Update team fields
        if (name) team.name = name;
        if (description !== undefined) team.description = description;
        if (maxMembers) team.maxMembers = maxMembers;
        if (settings) team.settings = { ...team.settings, ...settings };
        if (tags) team.tags = tags;
        if (color) team.color = color;
        if (teamLead) team.teamLead = teamLead;

        await team.save();

        const updatedTeam = await Team.findById(teamId)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: updatedTeam
        });

    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update team",
            error: error.message
        });
    }
};

// Add member to team
export const addTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId, role, permissions } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if user has permission to add members
        const userMember = team.members.find(member =>
            member.userId.toString() === req.user._id.toString() &&
            (member.role === "Manager" || member.permissions.canManageTeam)
        );

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to add members to this team"
            });
        }

        // Check if user is already a member
        const existingMember = team.members.find(member =>
            member.userId.toString() === userId
        );

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this team"
            });
        }

        // Check team size limit
        if (team.members.length >= team.maxMembers) {
            return res.status(400).json({
                success: false,
                message: "Team has reached maximum member limit"
            });
        }

        // Add member to team
        team.members.push({
            userId,
            role: role || "Member",
            permissions: permissions || {},
            isActive: true
        });

        await team.save();

        // Update CompanyUser document
        await CompanyUser.findOneAndUpdate(
            { userId, companyId: team.companyId },
            { $push: { teams: { teamId: team._id, role: role || "Member" } } },
            { upsert: true }
        );

        const updatedTeam = await Team.findById(teamId)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Member added to team successfully",
            data: updatedTeam
        });

    } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add team member",
            error: error.message
        });
    }
};

// Remove member from team
export const removeTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if user has permission to remove members
        const userMember = team.members.find(member =>
            member.userId.toString() === req.user._id.toString() &&
            (member.role === "Manager" || member.permissions.canManageTeam)
        );

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to remove members from this team"
            });
        }

        // Prevent removing the last manager
        const managers = team.members.filter(member => member.role === "Manager" && member.isActive);
        const memberToRemove = team.members.find(member =>
            member.userId.toString() === userId && member.isActive
        );

        if (memberToRemove && memberToRemove.role === "Manager" && managers.length === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the last manager from the team"
            });
        }

        // Remove member from team
        const memberIndex = team.members.findIndex(member =>
            member.userId.toString() === userId
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Member not found in team"
            });
        }

        team.members[memberIndex].isActive = false;
        await team.save();

        // Update CompanyUser document
        await CompanyUser.findOneAndUpdate(
            { userId, companyId: team.companyId },
            { $pull: { teams: { teamId: team._id } } }
        );

        const updatedTeam = await Team.findById(teamId)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Member removed from team successfully",
            data: updatedTeam
        });

    } catch (error) {
        console.error("Error removing team member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove team member",
            error: error.message
        });
    }
};

// Update team member role and permissions
export const updateTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const { role, permissions } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if user has permission to update members
        const userMember = team.members.find(member =>
            member.userId.toString() === req.user._id.toString() &&
            (member.role === "Manager" || member.permissions.canManageTeam)
        );

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to update members in this team"
            });
        }

        // Find and update member
        const memberIndex = team.members.findIndex(member =>
            member.userId.toString() === userId
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Member not found in team"
            });
        }

        // Prevent changing the last manager
        if (team.members[memberIndex].role === "Manager" && role !== "Manager") {
            const managers = team.members.filter(member =>
                member.role === "Manager" && member.isActive
            );
            if (managers.length === 1) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot change the role of the last manager"
                });
            }
        }

        // Update member
        if (role) team.members[memberIndex].role = role;
        if (permissions) {
            team.members[memberIndex].permissions = {
                ...team.members[memberIndex].permissions,
                ...permissions
            };
        }

        await team.save();

        // Update CompanyUser document
        await CompanyUser.findOneAndUpdate(
            { userId, companyId: team.companyId, "teams.teamId": team._id },
            { $set: { "teams.$.role": role || team.members[memberIndex].role } }
        );

        const updatedTeam = await Team.findById(teamId)
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(200).json({
            success: true,
            message: "Team member updated successfully",
            data: updatedTeam
        });

    } catch (error) {
        console.error("Error updating team member:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update team member",
            error: error.message
        });
    }
};

// Delete team
export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Check if user has permission to delete team
        const userMember = team.members.find(member =>
            member.userId.toString() === req.user._id.toString() &&
            (member.role === "Manager" || member.permissions.canManageTeam)
        );

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this team"
            });
        }

        // Soft delete the team
        team.isActive = false;
        await team.save();

        // Remove team from all CompanyUser documents
        await CompanyUser.updateMany(
            { companyId: team.companyId },
            { $pull: { teams: { teamId: team._id } } }
        );

        res.status(200).json({
            success: true,
            message: "Team deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete team",
            error: error.message
        });
    }
};

// Get user's teams
export const getUserTeams = async (req, res) => {
    try {
        const userId = req.user._id;
        const { companyId } = req.params;

        const companyUser = await CompanyUser.findOne({
            userId,
            companyId,
            status: "active"
        });

        if (!companyUser) {
            return res.status(404).json({
                success: false,
                message: "User not found in company"
            });
        }

        const teamIds = companyUser.teams.map(team => team.teamId);

        const teams = await Team.find({
            _id: { $in: teamIds },
            isActive: true
        })
            .populate('members.userId', 'fullname email profile.profilePhoto')
            .populate('createdBy', 'fullname email')
            .populate('teamLead', 'fullname email');

        res.status(200).json({
            success: true,
            data: teams
        });

    } catch (error) {
        console.error("Error fetching user teams:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user teams",
            error: error.message
        });
    }
};

