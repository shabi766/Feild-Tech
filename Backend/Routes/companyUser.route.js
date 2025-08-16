import express from "express";
import {
    inviteUserToCompany,
    acceptCompanyInvitation,
    getCompanyUsers,
    getCompanyUserDetails,
    updateCompanyUser,
    removeUserFromCompany,
    resendInvitation,
    getUserCompanyMemberships,
    bulkInviteUsers,
    ensureCompanyOwnerHasAdminRole
} from "../Controllers/companyUser.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCompanyManager from "../middleware/isCompanyManager.js";
import isCompanyMember from "../middleware/isCompanyMember.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Company user management routes (require company member permissions for basic operations)
router.post("/:companyId/invite", isCompanyMember, inviteUserToCompany);
router.post("/:companyId/bulk-invite", isCompanyMember, bulkInviteUsers);
router.get("/:companyId", isCompanyMember, getCompanyUsers);
router.get("/:companyId/:userId", isCompanyMember, getCompanyUserDetails);

// Advanced operations still require manager permissions
router.put("/:companyId/:userId", isCompanyManager, updateCompanyUser);
router.delete("/:companyId/:userId", isCompanyManager, removeUserFromCompany);

// Invitation management
router.post("/accept-invitation", acceptCompanyInvitation);
router.post("/:companyId/:userId/resend", isCompanyMember, resendInvitation);

// User's company memberships
router.get("/user/memberships", getUserCompanyMemberships);

// Admin role management for company owners
router.post("/:companyId/ensure-admin-role", isCompanyMember, ensureCompanyOwnerHasAdminRole);

export default router;
