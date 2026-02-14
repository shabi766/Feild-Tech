import express from 'express';
import {
    createRating,
    getRatingsForEntity,
    getEntityAverageRating,
    updateRating,
    deleteRating,
    addRatingResponse
} from '../Controllers/rating.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

// Public routes
router.get('/:entityType/:entityId', getRatingsForEntity);
router.get('/:entityType/:entityId/average', getEntityAverageRating);

// Protected routes (require authentication)
router.post('/', isAuthenticated, createRating);
router.put('/:ratingId', isAuthenticated, updateRating);
router.delete('/:ratingId', isAuthenticated, deleteRating);
router.post('/:ratingId/response', isAuthenticated, addRatingResponse);

export default router;
