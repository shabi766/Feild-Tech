import express from "express";
import { deleteAccount, getChatUsers, getProfile, getUsersForChat, login, logout, register, searchUsers, updateProfile, updateUserSettings } from "../Controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated,logout);
router.route("/profile/update").post(singleUpload,isAuthenticated,updateProfile);
router.route("/users").get(isAuthenticated, getUsersForChat);
router.route("/chat-users").get(isAuthenticated, getChatUsers);
router.route("/search-users").get(isAuthenticated, searchUsers);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/update/:id").put(isAuthenticated, updateUserSettings);
router.route('/delete-account/:id').delete(isAuthenticated, deleteAccount); 


export default router;