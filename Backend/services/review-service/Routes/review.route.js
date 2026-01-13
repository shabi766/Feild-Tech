import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    createReview,
    getTechnicianReviews,
    getTechnicianReviewStats,
    updateReview,
    deleteReview
} from "../Controllers/review.controller.js";

const router = express.Router();

// All routes require authentication
router.route("/").post(isAuthenticated, createReview);
router.route("/technician/:technicianId").get(isAuthenticated, getTechnicianReviews);
router.route("/technician/:technicianId/stats").get(isAuthenticated, getTechnicianReviewStats);
router.route("/:reviewId").put(isAuthenticated, updateReview);
router.route("/:reviewId").delete(isAuthenticated, deleteReview);

export default router;
