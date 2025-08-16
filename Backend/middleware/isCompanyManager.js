import { CompanyUser } from "../Models/companyUser.model.js";
import { Role } from "../Models/role.model.js";

const isCompanyManager = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                message: "User not authenticated", 
                success: false 
            });
        }

        const { companyId } = req.params;
        if (!companyId) {
            return res.status(400).json({ 
                message: "Company ID is required", 
                success: false 
            });
        }

        // Check if user is associated with the company
        const companyUser = await CompanyUser.findOne({
            userId: req.user._id,
            companyId: companyId,
            status: "active"
        }).populate('roleId');

        if (!companyUser) {
            return res.status(403).json({ 
                message: "User is not associated with this company", 
                success: false 
            });
        }

        // Check if user has manager-level permissions
        const role = companyUser.roleId;
        if (!role) {
            return res.status(403).json({ 
                message: "User role not found", 
                success: false 
            });
        }

        // More flexible permission check - allow company recruiters and managers
        const hasManagerPermission = 
            role.permissions.canManageTeamMembers ||
            role.permissions.canInviteUsers ||
            role.permissions.canChangeUserRoles ||
            role.permissions.canCreateTeams ||
            role.permissions.canEditTeams ||
            role.level >= 5 || // Lowered from 7 to 5 to include more roles
            role.name.toLowerCase().includes('recruiter') || // Allow recruiters
            role.name.toLowerCase().includes('manager') ||   // Allow managers
            role.name.toLowerCase().includes('admin') ||     // Allow admins
            role.name.toLowerCase().includes('owner');       // Allow owners

        if (!hasManagerPermission) {
            return res.status(403).json({ 
                message: "Access denied. Company member privileges required.", 
                success: false 
            });
        }

        // Add company user info to request
        req.companyUser = companyUser;
        req.userRole = role;
        next();
    } catch (error) {
        console.error("Company Manager Authentication Error:", error);
        return res.status(500).json({ 
            message: "Authentication failed", 
            success: false, 
            error: error.message 
        });
    }
};

export default isCompanyManager;

