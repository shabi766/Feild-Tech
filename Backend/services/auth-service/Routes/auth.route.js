import express from "express";
import {
    register, login, logout, getMe, forgotPassword, verifyOtp, resetPassword, verifyToken, refreshToken,
    getUserById, getUsersByIds, updateUserStripeData, updateUserWalletBalance, updateUserKYC, updateUserRating
} from "../Controllers/auth.controller.js";
import {
    getAllUsers, updateUserStatus, deleteUser, updateProfile, changePassword,
    getTechnicians, getTechnicianById
} from "../Controllers/user.controller.js";
import {
    getKYCRequests, getKYCDetails, updateKYCStatus, getAllKYC, getKYCStatistics, deleteKYC, submitKYC
} from "../Controllers/kyc.controller.js";
import {
    updateSettings, getUserSettings, resetSettings, updateProfilePhoto
} from "../Controllers/settings.controller.js";
import { singleUpload } from "../middleware/multer.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { validate, registerSchema, loginSchema, updateUserSchema } from "../../shared-middleware/validation.js";

const router = express.Router();

// Public routes
router.route("/register").post(singleUpload, validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMe);
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

router.route("/reset-password/:token").post(resetPassword);
router.route("/refresh-token").post(refreshToken);

// User Profile & Settings
router.route("/profile").put(isAuthenticated, validate(updateUserSchema), updateProfile);
router.route("/profile/update").put(isAuthenticated, validate(updateUserSchema), updateProfile);
router.route("/update-profile").put(isAuthenticated, validate(updateUserSchema), updateProfile);
router.route("/update/:id").put(isAuthenticated, updateSettings);
router.route("/update-settings").put(isAuthenticated, updateSettings);
router.route("/settings").get(isAuthenticated, getUserSettings);
router.route("/settings/reset").post(isAuthenticated, resetSettings);
router.route("/update-profile-photo").put(isAuthenticated, singleUpload, updateProfilePhoto);
router.route("/delete-account").delete(isAuthenticated, deleteUser);
router.route("/delete-account/:id").delete(isAuthenticated, deleteUser);

// Admin routes
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/user/:id").get(isAuthenticated, getUserById);
router.route("/user/:id/status").put(isAuthenticated, updateUserStatus);
router.route("/user/:id").delete(isAuthenticated, deleteUser);

// KYC routes
router.route("/kyc/verify").post(isAuthenticated, submitKYC);
router.route("/kyc/:userId/status").put(isAuthenticated, updateKYCStatus);
router.route("/kyc/:userId").get(isAuthenticated, getKYCDetails);

export default router;
