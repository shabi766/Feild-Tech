import mongoose from 'mongoose';
import { Review } from '../Models/review.model.js';
import { WorkorderServiceClient } from '../Services/workorder-client.service.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { LeaderboardServiceClient } from '../Services/leaderboard-client.service.js';
import { getKafkaProducer, ReviewCreatedEvent, TOPICS } from '../../shared-kafka/index.js';

/**
 * Create a new review
 */
export const createReview = async (req, res) => {
    try {
        const { jobId, technicianId, rating, comment, categories, metrics } = req.body;
        const reviewerId = req.user.userId || req.user._id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        // Validate that the job exists and is completed/paid
        const job = await WorkorderServiceClient.getWorkorder(jobId, token);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found',
                success: false
            });
        }

        if (!['Complete', 'Paid'].includes(job.status)) {
            return res.status(400).json({
                message: 'Can only review completed or paid jobs',
                success: false
            });
        }

        // Check if user has already reviewed this job
        const existingReview = await Review.findOne({
            jobId,
            reviewerId
        });

        if (existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this job',
                success: false
            });
        }

        // Validate that the reviewer is the job poster or assigned client
        if (job.created_by?.toString() !== reviewerId.toString() &&
            job.clientName?.toString() !== reviewerId.toString()) {
            return res.status(403).json({
                message: 'You can only review jobs you posted or are assigned to',
                success: false
            });
        }

        // Create the review
        const review = new Review({
            jobId,
            technicianId,
            reviewerId,
            rating,
            comment,
            categories: categories || [],
            metrics: metrics || {}
        });

        await review.save();

        // Update technician's rating stats (async, non-blocking)
        updateTechnicianRatingStats(technicianId, token).catch(err =>
            console.error('Error updating technician stats:', err)
        );

        // Notify leaderboard service (async, non-blocking)
        LeaderboardServiceClient.updateTechnicianStats(technicianId, token).catch(err =>
            console.warn('Leaderboard update failed (non-critical):', err)
        );

        // Publish review.created event
        try {
            const producer = getKafkaProducer('review-service');
            const event = new ReviewCreatedEvent({
                reviewId: review._id.toString(),
                jobId: review.jobId.toString(),
                technicianId: review.technicianId.toString(),
                reviewerId: review.reviewerId.toString(),
                rating: review.rating,
                comment: review.comment
            }, { source: 'review-service' });
            await producer.publishEvent(TOPICS.REVIEW_CREATED, event, review._id.toString());
            console.log('✅ Published review.created event for:', review._id);
        } catch (kafkaError) {
            console.error('⚠️ Failed to publish review.created event:', kafkaError);
        }

        return res.status(201).json({
            message: 'Review submitted successfully',
            review,
            success: true
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get reviews for a technician
 */
export const getTechnicianReviews = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const skip = (page - 1) * limit;

        // Build filter
        const filter = {
            technicianId,
            status: 'approved'
        };

        if (rating) {
            filter.rating = parseInt(rating);
        }

        // Build sort
        const sort = {};
        if (sortBy === 'rating') {
            sort.rating = -1;
        } else if (sortBy === 'helpful') {
            sort.helpfulVotes = -1;
        } else {
            sort.createdAt = -1;
        }

        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Enrich with reviewer and job data
        const enrichedReviews = await Promise.all(
            reviews.map(async (review) => {
                try {
                    const reviewer = await AuthServiceClient.getUser(review.reviewerId, token);
                    const job = await WorkorderServiceClient.getWorkorder(review.jobId, token);

                    return {
                        ...review.toObject(),
                        reviewer: reviewer || null,
                        job: job ? { _id: job._id, title: job.title } : null
                    };
                } catch (error) {
                    console.error('Error enriching review:', error);
                    return review.toObject();
                }
            })
        );

        const total = await Review.countDocuments(filter);

        return res.status(200).json({
            reviews: enrichedReviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalReviews: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            success: true
        });

    } catch (error) {
        console.error('Error fetching technician reviews:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get review statistics for a technician
 */
export const getTechnicianReviewStats = async (req, res) => {
    try {
        const { technicianId } = req.params;

        // Validate technicianId format
        if (!mongoose.Types.ObjectId.isValid(technicianId)) {
            return res.status(400).json({
                message: 'Invalid technician ID format',
                success: false
            });
        }

        const stats = await Review.aggregate([
            { $match: { technicianId: new mongoose.Types.ObjectId(technicianId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingBreakdown: {
                        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({
                stats: {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingBreakdown: {
                        fiveStar: 0,
                        fourStar: 0,
                        threeStar: 0,
                        twoStar: 0,
                        oneStar: 0
                    }
                },
                success: true
            });
        }

        return res.status(200).json({
            stats: stats[0],
            success: true
        });

    } catch (error) {
        console.error('Error fetching review stats:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Update a review (only by the original reviewer)
 */
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, categories, metrics } = req.body;
        const userId = req.user.userId || req.user._id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: 'Review not found',
                success: false
            });
        }

        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You can only update your own reviews',
                success: false
            });
        }

        // Update review
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                rating,
                comment,
                categories,
                metrics,
                updatedAt: new Date()
            },
            { new: true }
        );

        // Update technician stats (async)
        updateTechnicianRatingStats(review.technicianId, token).catch(err =>
            console.error('Error updating technician stats:', err)
        );

        // Notify leaderboard service (async)
        LeaderboardServiceClient.updateTechnicianStats(review.technicianId, token).catch(err =>
            console.warn('Leaderboard update failed (non-critical):', err)
        );

        return res.status(200).json({
            message: 'Review updated successfully',
            review: updatedReview,
            success: true
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Delete a review (only by the original reviewer)
 */
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId || req.user._id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: 'Review not found',
                success: false
            });
        }

        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You can only delete your own reviews',
                success: false
            });
        }

        const technicianId = review.technicianId;
        await Review.findByIdAndDelete(reviewId);

        // Update technician stats (async)
        updateTechnicianRatingStats(technicianId, token).catch(err =>
            console.error('Error updating technician stats:', err)
        );

        // Notify leaderboard service (async)
        LeaderboardServiceClient.updateTechnicianStats(technicianId, token).catch(err =>
            console.warn('Leaderboard update failed (non-critical):', err)
        );

        return res.status(200).json({
            message: 'Review deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Helper function to update technician rating stats
 * This updates the user model in Auth Service
 */
const updateTechnicianRatingStats = async (technicianId, token) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(technicianId)) {
            console.error('Invalid technician ID format:', technicianId);
            return;
        }

        const stats = await Review.aggregate([
            { $match: { technicianId: new mongoose.Types.ObjectId(technicianId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingBreakdown: {
                        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                    }
                }
            }
        ]);

        if (stats.length > 0) {
            const stat = stats[0];
            // Update user in Auth Service
            const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
            await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/users/${technicianId}/rating`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    averageRating: Math.round(stat.averageRating * 10) / 10,
                    totalReviews: stat.totalReviews,
                    ratingBreakdown: stat.ratingBreakdown
                })
            }).catch(err => console.error('Error updating user rating:', err));
        }
    } catch (error) {
        console.error('Error updating technician rating stats:', error);
    }
};
