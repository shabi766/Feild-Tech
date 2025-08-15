import express from "express";
import { deleteAccount, getChatUsers, getProfile, getUsersForChat, login, logout, register, searchUsers, updateProfile, updateUserSettings, getUserSettings, forgotPassword, verifyOtp, resetPassword } from "../Controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { singleUpload, multipleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout); // Removed isAuthenticated middleware
router.route("/profile/update").post(multipleUpload,isAuthenticated,updateProfile);
router.route("/users").get(isAuthenticated, getUsersForChat);
router.route("/chat-users").get(isAuthenticated, getChatUsers);
router.route("/search-users").get(isAuthenticated, searchUsers);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/settings/:id").get(isAuthenticated, getUserSettings);
router.route("/update/:id").put(isAuthenticated, updateUserSettings);
router.route('/delete-account/:id').delete(isAuthenticated, deleteAccount); 

// Forgot Password Routes
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

export default router;