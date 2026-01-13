import express from "express";
import { getTestimonials, createTestimonial } from "../Controllers/Testimonial.controller.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", createTestimonial);

export default router;
