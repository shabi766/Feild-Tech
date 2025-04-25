import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getDashboardStats } from "../Controllers/dashboard.controller.js";

const router = express.Router();

router.route("/stats").get(isAuthenticated, getDashboardStats);
export default router;