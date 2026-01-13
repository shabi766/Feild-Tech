import express from "express";
import { 
    changePassword, 
    updateProfile, 
    updateSettings, 
    getUserSettings, 
    resetSettings, 
    updateProfilePhoto 
} from "../Controllers/settings.controller";
import isAuthenticated from "../middleware/isAuthenticated";

const router = express.Router();

// Profile and security
router.route("/update-profile").put(isAuthenticated, updateProfile);
router.route("/change-password").put(isAuthenticated, changePassword);
router.route("/update-profile-photo").put(isAuthenticated, updateProfilePhoto);

// Comprehensive settings
router.route("/update-settings").put(isAuthenticated, updateSettings);
router.route("/get-settings").get(isAuthenticated, getUserSettings);
router.route("/reset-settings").post(isAuthenticated, resetSettings);

export default router;
