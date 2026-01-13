import express from "express";
import { 
    getSystemSettings, 
    updateSystemSettings, 
    updateAllSystemSettings,
    resetSettingsToDefaults 
} from "../Controllers/systemSettings.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(isAuthenticated);
router.use(isAdmin);

// System settings routes
router.get("/", getSystemSettings);
router.put("/:category", updateSystemSettings);
router.put("/", updateAllSystemSettings);
router.post("/:category/reset", resetSettingsToDefaults);

export default router;
