import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    applyJob,
    getAppliedJobs,
    getApplicants,
    updateStatus,
    getApplicationsForCalendar
} from "../Controllers/application.controller.js";

const router = express.Router();

// All routes require authentication
router.route("/apply/:id").post(isAuthenticated, applyJob);
router.route("/my-applications").get(isAuthenticated, getAppliedJobs);
router.route("/job/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/:id/status").put(isAuthenticated, updateStatus);
router.route("/calendar").get(isAuthenticated, getApplicationsForCalendar);

export default router;
