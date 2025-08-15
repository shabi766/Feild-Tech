import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    createReview,
    getTechnicianReviews,
    getTechnicianReviewStats,
    updateReview,
    deleteReview
} from '../Controllers/review.controller.js';

const router = express.Router();

// Create a new review (recruiter/client reviews technician)
router.post('/create', isAuthenticated, createReview);

// Get reviews for a specific technician
router.get('/technician/:technicianId', getTechnicianReviews);

// Get review statistics for a technician
router.get('/technician/:technicianId/stats', getTechnicianReviewStats);

// Update a review (only by original reviewer)
router.put('/:reviewId', isAuthenticated, updateReview);

// Delete a review (only by original reviewer)
router.delete('/:reviewId', isAuthenticated, deleteReview);

export default router;
