import { CompanyUser } from "../services/company-service/Models/companyUser.model.js";
// User model import removed as we use req.user (populated by isAuthenticated)

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

        // Use req.user directly instead of fetching from DB
        // req.user is populated by isAuthenticated middleware with token payload
        const userCompanyId = req.user.companyId;
        const userRole = req.user.role;
        const userRecruiterType = req.user.recruiterType;

        // check if user has companyId in their profile (from token)
        if (userCompanyId === companyId) {
            // User has companyId in their profile, allow access
            req.companyUser = { userId: req.user._id, companyId, status: "active" };
            return next();
        }

        // Check if user exists in CompanyUser collection with any status
        // We still need CompanyUser model for this check
        const companyUser = await CompanyUser.findOne({
            userId: req.user._id,
            companyId: companyId
        });

        if (companyUser) {
            // User exists in CompanyUser collection, allow access
            req.companyUser = companyUser;
            return next();
        }

        // Check if user is a company owner/recruiter based on token role
        if (userRole === "Company" || userRecruiterType === "Company") {
            if (userCompanyId === companyId) {
                req.companyUser = { userId: req.user._id, companyId, status: "active" };
                return next();
            }
        }

        // User is not associated with this company
        return res.status(403).json({
            message: "User is not associated with this company. Please contact your administrator.",
            success: false,
            debug: {
                userCompanyId: userCompanyId,
                requestedCompanyId: companyId,
                userRole: userRole,
                userRecruiterType: userRecruiterType,
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
