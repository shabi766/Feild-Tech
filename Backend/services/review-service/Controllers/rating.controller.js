import { Rating } from '../Models/rating.model.js';
import mongoose from 'mongoose';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { WorkorderServiceClient } from '../Services/workorder-client.service.js';

/**
 * Create a new rating
 */
export const createRating = async (req, res) => {
    try {
        const { ratedEntity, entityId, rating, review, workorderId, categories } = req.body;
        const ratedBy = req.user.userId || req.user._id;

        // Validate required fields
        if (!ratedEntity || !entityId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'ratedEntity, entityId, and rating are required'
            });
        }

        // Validate rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if rating already exists for this workorder
        if (workorderId) {
            const existingRating = await Rating.findOne({
                entityId,
                ratedBy,
                workorderId
            });

            if (existingRating) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this entity for this job'
                });
            }
        }

        // Create the rating
        const newRating = await Rating.create({
            ratedEntity,
            entityId: mongoose.Types.ObjectId(entityId),
            ratedBy: mongoose.Types.ObjectId(ratedBy),
            rating,
            review,
            workorderId: workorderId ? mongoose.Types.ObjectId(workorderId) : null,
            categories
        });

        // Update entity's average rating asynchronously
        updateEntityAverageRating(ratedEntity, entityId).catch(err => {
            console.error('Error updating entity average rating:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Rating created successfully',
            data: newRating
        });
    } catch (error) {
        console.error('Error creating rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create rating',
            error: error.message
        });
    }
};

/**
 * Get ratings for a specific entity
 */
export const getRatingsForEntity = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        // Get ratings
        const ratings = await Rating.find({
            ratedEntity: entityType,
            entityId: mongoose.Types.ObjectId(entityId)
        })
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get total count
        const total = await Rating.countDocuments({
            ratedEntity: entityType,
            entityId: mongoose.Types.ObjectId(entityId)
        });

        // Calculate average rating and statistics
        const stats = await Rating.aggregate([
            {
                $match: {
                    ratedEntity: entityType,
                    entityId: mongoose.Types.ObjectId(entityId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                    fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        const statistics = stats[0] || {
            averageRating: 0,
            totalRatings: 0,
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0
        };

        // Enrich ratings with user data
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (token && ratings.length > 0) {
            const userIds = [...new Set(ratings.map(r => r.ratedBy.toString()))];
            try {
                const users = await AuthServiceClient.getUsers(userIds, token);
                ratings.forEach(rating => {
                    const user = users.find(u => (u._id || u.id)?.toString() === rating.ratedBy.toString());
                    if (user) {
                        rating.ratedByUser = {
                            _id: user._id || user.id,
                            fullname: user.fullname,
                            profile: user.profile
                        };
                    }
                });
            } catch (error) {
                console.error('Error enriching ratings with user data:', error);
            }
        }

        res.json({
            success: true,
            data: {
                ratings,
                statistics,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch ratings',
            error: error.message
        });
    }
};

/**
 * Get average rating for an entity
 */
export const getEntityAverageRating = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;

        const result = await Rating.aggregate([
            {
                $match: {
                    ratedEntity: entityType,
                    entityId: mongoose.Types.ObjectId(entityId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const data = result[0] || { averageRating: 0, totalRatings: 0 };

        res.json({
            success: true,
            data: {
                averageRating: Math.round(data.averageRating * 10) / 10,
                totalRatings: data.totalRatings
            }
        });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch average rating',
            error: error.message
        });
    }
};

/**
 * Update a rating
 */
export const updateRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { rating, review, categories } = req.body;
        const userId = req.user.userId || req.user._id;

        // Find the rating
        const existingRating = await Rating.findById(ratingId);
        if (!existingRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Check if user owns this rating
        if (existingRating.ratedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own ratings'
            });
        }

        // Update fields
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            existingRating.rating = rating;
        }
        if (review !== undefined) existingRating.review = review;
        if (categories !== undefined) existingRating.categories = categories;

        await existingRating.save();

        // Update entity's average rating
        updateEntityAverageRating(existingRating.ratedEntity, existingRating.entityId).catch(err => {
            console.error('Error updating entity average rating:', err);
        });

        res.json({
            success: true,
            message: 'Rating updated successfully',
            data: existingRating
        });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update rating',
            error: error.message
        });
    }
};

/**
 * Delete a rating
 */
export const deleteRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const userId = req.user.userId || req.user._id;

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Check if user owns this rating
        if (rating.ratedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own ratings'
            });
        }

        const { ratedEntity, entityId } = rating;
        await Rating.findByIdAndDelete(ratingId);

        // Update entity's average rating
        updateEntityAverageRating(ratedEntity, entityId).catch(err => {
            console.error('Error updating entity average rating:', err);
        });

        res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete rating',
            error: error.message
        });
    }
};

/**
 * Add a response to a rating (for entity owners)
 */
export const addRatingResponse = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { text } = req.body;
        const userId = req.user.userId || req.user._id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Response text is required'
            });
        }

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // TODO: Verify that user owns the entity being rated
        // For now, allow any authenticated user to respond

        rating.response = {
            text,
            respondedAt: new Date()
        };

        await rating.save();

        res.json({
            success: true,
            message: 'Response added successfully',
            data: rating
        });
    } catch (error) {
        console.error('Error adding response:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add response',
            error: error.message
        });
    }
};

/**
 * Helper function to update entity's average rating
 */
async function updateEntityAverageRating(entityType, entityId) {
    try {
        const result = await Rating.aggregate([
            {
                $match: {
                    ratedEntity: entityType,
                    entityId: mongoose.Types.ObjectId(entityId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const { averageRating = 0, totalRatings = 0 } = result[0] || {};

        // TODO: Update the entity in its respective service
        // This would require calling the appropriate service client
        console.log(`Updated ${entityType} ${entityId}: avg=${averageRating}, total=${totalRatings}`);

        return { averageRating, totalRatings };
    } catch (error) {
        console.error('Error in updateEntityAverageRating:', error);
        throw error;
    }
}

export default {
    createRating,
    getRatingsForEntity,
    getEntityAverageRating,
    updateRating,
    deleteRating,
    addRatingResponse
};
