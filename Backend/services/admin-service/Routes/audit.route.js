import express from "express";
import { 
    getAuditLogs,
    getSuspiciousActivities,
    getUserActivitySummary,
    getAuditStats,
    exportAuditLogs,
    cleanOldLogs
} from "../Controllers/audit.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(isAuthenticated);
router.use(isAdmin);

// Audit routes
router.get("/logs", getAuditLogs);
router.get("/suspicious", getSuspiciousActivities);
router.get("/user/:userId/summary", getUserActivitySummary);
router.get("/stats", getAuditStats);
router.get("/export", exportAuditLogs);
router.delete("/cleanup", cleanOldLogs);

export default router;
