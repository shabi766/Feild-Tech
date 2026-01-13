import express from 'express';
import { getCompanyDashboardStats, getIndividualRecruiterDashboardStats } from '../Controllers/dashboard.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

// Company dashboard stats
router.get('/company/:companyId/stats', isAuthenticated, getCompanyDashboardStats);

// Individual recruiter dashboard stats
router.get('/individual-recruiter/:recruiterId/stats', isAuthenticated, getIndividualRecruiterDashboardStats);

export default router;