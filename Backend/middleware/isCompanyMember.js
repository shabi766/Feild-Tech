import { CompanyUser } from "../Models/companyUser.model.js";
import { User } from "../Models/user.model.js";

const isCompanyMember = async (req, res, next) => {
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

        // First, check if user has companyId in their profile
        const userProfile = await User.findById(req.user._id).select('companyId role recruiterType');
        
        if (userProfile?.companyId?.toString() === companyId) {
            // User has companyId in their profile, allow access
            req.companyUser = { userId: req.user._id, companyId, status: "active" };
            return next();
        }

        // Check if user exists in CompanyUser collection with any status
        const companyUser = await CompanyUser.findOne({
            userId: req.user._id,
            companyId: companyId
        });

        if (companyUser) {
            // User exists in CompanyUser collection, allow access
            req.companyUser = companyUser;
            return next();
        }

        // If neither exists, check if user is a company owner/recruiter
        if (userProfile?.role === "Company" || userProfile?.recruiterType === "Company") {
            // User is a company user, allow access
            req.companyUser = { userId: req.user._id, companyId, status: "active" };
            return next();
        }

        // User is not associated with this company
        return res.status(403).json({ 
            message: "User is not associated with this company. Please contact your administrator.", 
            success: false,
            debug: {
                userCompanyId: userProfile?.companyId,
                requestedCompanyId: companyId,
                userRole: userProfile?.role,
                userRecruiterType: userProfile?.recruiterType,
                hasCompanyUserRecord: !!companyUser
            }
        });

    } catch (error) {
        console.error("Company Member Authentication Error:", error);
        return res.status(500).json({ 
            message: "Authentication failed", 
            success: false, 
            error: error.message 
        });
    }
};

export default isCompanyMember;
