import express from "express";
import { 
    register, login, logout, forgotPassword, verifyOtp, resetPassword, verifyToken, 
    getUserById, getUsersByIds, updateUserStripeData, updateUserWalletBalance, updateUserKYC, updateUserRating
} from "../Controllers/auth.controller.js";
import {
    getAllUsers, updateUserStatus, deleteUser, updateProfile, changePassword,
    getTechnicians, getTechnicianById
} from "../Controllers/user.controller.js";
import {
    getKYCRequests, getKYCDetails, updateKYCStatus, getAllKYC, getKYCStatistics, deleteKYC
} from "../Controllers/kyc.controller.js";
import {
    updateSettings, getUserSettings, resetSettings, updateProfilePhoto
} from "../Controllers/settings.controller.js";
import { singleUpload } from "../middleware/multer.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// Public routes
router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

// Token verification endpoint (for other services)
router.route("/verify").post(verifyToken);

// User endpoints (for other services to fetch user data)
router.route("/users/:userId").get(getUserById);
router.route("/users/batch").post(getUsersByIds);

// User update endpoints (for Payment Service and Review Service)
router.route("/users/:userId/stripe").patch(updateUserStripeData);
router.route("/users/:userId/wallet").patch(updateUserWalletBalance);
router.route("/users/:userId/kyc").patch(updateUserKYC);
router.route("/users/:userId/rating").put(updateUserRating);

// User Management (Admin)
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/users/:userId/status").put(isAuthenticated, updateUserStatus);
router.route("/users/:userId").delete(isAuthenticated, deleteUser);

// User Profile & Settings
router.route("/profile").put(isAuthenticated, updateProfile);
router.route("/profile/password").put(isAuthenticated, changePassword);
router.route("/profile/photo").put(isAuthenticated, singleUpload, updateProfilePhoto);
router.route("/settings").get(isAuthenticated, getUserSettings);
router.route("/settings").put(isAuthenticated, updateSettings);
router.route("/settings/reset").post(isAuthenticated, resetSettings);

// Technician Queries
router.route("/technicians").get(isAuthenticated, getTechnicians);
router.route("/technicians/:id").get(isAuthenticated, getTechnicianById);

// KYC Management (Admin)
router.route("/kyc/requests").get(isAuthenticated, getKYCRequests);
router.route("/kyc/all").get(isAuthenticated, getAllKYC);
router.route("/kyc/stats").get(isAuthenticated, getKYCStatistics);
router.route("/kyc/:userId").get(isAuthenticated, getKYCDetails);
router.route("/kyc/:userId/status").put(isAuthenticated, updateKYCStatus);
router.route("/kyc/:userId").delete(isAuthenticated, deleteKYC);

export default router;
