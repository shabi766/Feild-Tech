import express from "express";
import {
    createTeam,
    getCompanyTeams,
    getTeamDetails,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    deleteTeam,
    getUserTeams
} from "../Controllers/team.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCompanyManager from "../middleware/isCompanyManager.js";
import isCompanyMember from "../middleware/isCompanyMember.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Team management routes
router.post("/:companyId", isCompanyManager, createTeam);
router.get("/:companyId", isCompanyMember, getCompanyTeams);
router.get("/details/:teamId", isCompanyMember, getTeamDetails);
router.put("/:teamId", isCompanyManager, updateTeam);
router.delete("/:teamId", isCompanyManager, deleteTeam);

// Team member management routes
router.post("/:teamId/members", isCompanyManager, addTeamMember);
router.delete("/:teamId/members/:userId", isCompanyManager, removeTeamMember);
router.put("/:teamId/members/:userId", isCompanyManager, updateTeamMember);

// User's teams
router.get("/user/:companyId", isCompanyMember, getUserTeams);

export default router;
