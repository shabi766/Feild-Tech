import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getProject, registerProject, updateProject, getProjectsByClientId, getProjectById } from "../Controllers/project.controller.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, isAuthenticated, registerProject);
router.route("/get").get(isAuthenticated, getProject);
router.route("/get/:id").get(isAuthenticated, getProjectById);
router.route("/get-by-client/:clientId").get(isAuthenticated, getProjectsByClientId);
router.route("/update/:id").put(isAuthenticated, singleUpload, updateProject);

export default router;
