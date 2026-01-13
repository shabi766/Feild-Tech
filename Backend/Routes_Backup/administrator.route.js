import express from "express";
import {
    getSystemSettings,
    updateSystemSettings,
    updateAllSystemSettings,
    resetSettingsToDefaults,
    getSystemStats,
    testEmailConfiguration,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getKYCRequests,
    updateKYCStatus
} from "../Controllers/administrator.controller.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAdmin);

// System Settings Routes
router.route("/settings")
    .get(getSystemSettings)
    .put(updateAllSystemSettings);

router.route("/settings/:category")
    .put(updateSystemSettings);

router.route("/settings/:category/reset")
    .post(resetSettingsToDefaults);

// System Statistics
router.route("/stats")
    .get(getSystemStats);

// User Management Routes
router.route("/users")
    .get(getAllUsers);

router.route("/users/:userId/status")
    .put(updateUserStatus);

router.route("/users/:userId")
    .delete(deleteUser);

// KYC Management Routes
router.route("/kyc/requests")
    .get(getKYCRequests);

router.route("/kyc/:userId/status")
    .put(updateKYCStatus);

// Email Configuration Test
router.route("/test-email")
    .post(testEmailConfiguration);

export default router;
