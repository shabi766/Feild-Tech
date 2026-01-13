import express from "express";
import AuditController from "../Controllers/audit.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// All audit routes require authentication and admin privileges
router.use(isAuthenticated);
router.use(isAdmin);

// Get all audit logs with filtering and pagination
router.get("/logs", AuditController.getAuditLogs);

// Get suspicious activities
router.get("/suspicious", AuditController.getSuspiciousActivities);

// Get user activity summary
router.get("/user/:userId/summary", AuditController.getUserActivitySummary);

// Get audit statistics
router.get("/stats", AuditController.getAuditStats);

// Export audit logs to CSV
router.get("/export", AuditController.exportAuditLogs);

// Clean old audit logs
router.delete("/cleanup", AuditController.cleanOldLogs);

export default router;
