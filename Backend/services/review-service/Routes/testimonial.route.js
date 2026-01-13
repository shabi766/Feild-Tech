import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    getTestimonials,
    createTestimonial,
    updateTestimonialStatus,
    deleteTestimonial
} from "../Controllers/testimonial.controller.js";

const router = express.Router();

router.route("/").get(getTestimonials);
router.route("/").post(isAuthenticated, createTestimonial);
router.route("/:testimonialId/status").put(isAuthenticated, updateTestimonialStatus);
router.route("/:testimonialId").delete(isAuthenticated, deleteTestimonial);

export default router;
