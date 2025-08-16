import express from "express";
import {
    createRole,
    getCompanyRoles,
    getRoleDetails,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUsersWithRole,
    createDefaultRoles
} from "../Controllers/role.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCompanyManager from "../middleware/isCompanyManager.js";
import isCompanyMember from "../middleware/isCompanyMember.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Role management routes
router.post("/:companyId", isCompanyManager, createRole);
router.get("/:companyId", isCompanyMember, getCompanyRoles);
router.get("/details/:roleId", isCompanyMember, getRoleDetails);
router.put("/:roleId", isCompanyManager, updateRole);
router.delete("/:roleId", isCompanyManager, deleteRole);

// Role assignment routes
router.post("/:companyId/assign/:userId", isCompanyManager, assignRoleToUser);
router.delete("/:companyId/remove/:userId", isCompanyManager, removeRoleFromUser);

// Get users with specific role
router.get("/:roleId/users", isCompanyMember, getUsersWithRole);

// Create default roles for a company
router.post("/:companyId/defaults", isCompanyManager, createDefaultRoles);

export default router;
