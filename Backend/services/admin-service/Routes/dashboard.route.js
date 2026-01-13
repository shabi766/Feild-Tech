import express from "express";
import { getCompanyDashboardStats, getIndividualRecruiterDashboardStats } from "../Controllers/dashboard.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

// All routes require authentication and admin access
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard routes
router.get("/company/:companyId", getCompanyDashboardStats);
router.get("/recruiter/:recruiterId", getIndividualRecruiterDashboardStats);

export default router;
