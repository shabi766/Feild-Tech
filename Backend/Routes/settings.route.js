import express from "express";
import { changePassword, updateProfile } from "../Controllers/settings.controller";
import isAuthenticated from "../middleware/isAuthenticated";


const router = express.Router();

router.route("/update-profile").put(isAuthenticated, updateProfile);
router.route("/change-password").put(isAuthenticated,changePassword);

export default router;
