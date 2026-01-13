import express from "express";
import { 
    register, login, logout, forgotPassword, verifyOtp, resetPassword, verifyToken, 
    getUserById, getUsersByIds, updateUserStripeData, updateUserWalletBalance, updateUserKYC 
} from "../Controllers/auth.controller.js";
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

// User update endpoints (for Payment Service)
router.route("/users/:userId/stripe").patch(updateUserStripeData);
router.route("/users/:userId/wallet").patch(updateUserWalletBalance);
router.route("/users/:userId/kyc").patch(updateUserKYC);

export default router;
