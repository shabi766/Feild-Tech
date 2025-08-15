import mongoose from 'mongoose';
import { Review } from '../Models/review.model.js';
import { User } from '../Models/user.model.js';
import { Workorder } from '../Models/workorder.model.js';
import { Leaderboard } from '../Models/leaderboard.model.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { jobId, technicianId, rating, comment, categories, metrics } = req.body;
        const reviewerId = req.user._id;

        // Validate that the job exists and is completed/paid
        const job = await Workorder.findById(jobId);
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
        if (job.created_by.toString() !== reviewerId.toString() && 
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

        // Update technician's rating stats
        await updateTechnicianRatingStats(technicianId);
        
        // Update leaderboard
        await updateLeaderboardStats(technicianId);

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

// Get reviews for a technician
export const getTechnicianReviews = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

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
            .populate('reviewerId', 'fullname profile.photo')
            .populate('jobId', 'title')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(filter);

        return res.status(200).json({
            reviews,
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

// Get review statistics for a technician
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

// Update a review (only by the original reviewer)
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, categories, metrics } = req.body;
        const userId = req.user._id;

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

        // Update technician stats
        await updateTechnicianRatingStats(review.technicianId);
        await updateLeaderboardStats(review.technicianId);

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

// Delete a review (only by the original reviewer)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

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

        await Review.findByIdAndDelete(reviewId);

        // Update technician stats
        await updateTechnicianRatingStats(review.technicianId);
        await updateLeaderboardStats(review.technicianId);

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

// Helper function to update technician rating stats
const updateTechnicianRatingStats = async (technicianId) => {
    try {
        // Validate technicianId format
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
            await User.findByIdAndUpdate(technicianId, {
                'rating.averageRating': Math.round(stat.averageRating * 10) / 10,
                'rating.totalReviews': stat.totalReviews,
                'rating.ratingBreakdown': stat.ratingBreakdown
            });
        }
    } catch (error) {
        console.error('Error updating technician rating stats:', error);
    }
};

// Helper function to update leaderboard stats
const updateLeaderboardStats = async (technicianId) => {
    try {
        // Validate technicianId format
        if (!mongoose.Types.ObjectId.isValid(technicianId)) {
            console.error('Invalid technician ID format:', technicianId);
            return;
        }

        // Get job statistics
        const jobStats = await Workorder.aggregate([
            { $match: { assignedApplicant: new mongoose.Types.ObjectId(technicianId) } },
            {
                $group: {
                    _id: null,
                    totalJobsAssigned: { $sum: 1 },
                    totalJobsCompleted: { $sum: { $cond: [{ $in: ['$status', ['Complete', 'Paid']] }, 1, 0] } },
                    ghostedJobs: { $sum: { $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0] } }
                }
            }
        ]);

        // Get review metrics
        const reviewMetrics = await Review.aggregate([
            { $match: { technicianId: new mongoose.Types.ObjectId(technicianId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    onTimeArrivalRate: { $avg: { $cond: ['$metrics.onTimeArrival', 100, 0] } },
                    jobCompletionRate: { $avg: { $cond: ['$metrics.jobCompletedOnTime', 100, 0] } },
                    avgQuality: { $avg: '$metrics.qualityOfWork' },
                    avgCommunication: { $avg: '$metrics.communication' },
                    avgProfessionalism: { $avg: '$metrics.professionalism' }
                }
            }
        ]);

        let leaderboardData = {
            technicianId,
            lastUpdated: new Date()
        };

        if (jobStats.length > 0) {
            const jobStat = jobStats[0];
            leaderboardData = {
                ...leaderboardData,
                totalJobsAssigned: jobStat.totalJobsAssigned,
                totalJobsCompleted: jobStat.totalJobsCompleted,
                ghostedJobs: jobStat.ghostedJobs,
                jobCompletionRate: jobStat.totalJobsAssigned > 0 ? 
                    Math.round((jobStat.totalJobsCompleted / jobStat.totalJobsAssigned) * 100) : 0
            };
        }

        if (reviewMetrics.length > 0) {
            const reviewMetric = reviewMetrics[0];
            leaderboardData = {
                ...leaderboardData,
                onTimeArrivalRate: Math.round(reviewMetric.onTimeArrivalRate || 0),
                averageResponseTime: Math.round(reviewMetric.avgQuality || 0)
            };
        }

        // Calculate overall score
        const overallScore = calculateOverallScore(leaderboardData);
        leaderboardData.overallScore = overallScore;

        // Update or create leaderboard entry
        await Leaderboard.findOneAndUpdate(
            { technicianId },
            leaderboardData,
            { upsert: true, new: true }
        );

        // Update user model
        await User.findByIdAndUpdate(technicianId, {
            'performance.totalJobsCompleted': leaderboardData.totalJobsCompleted || 0,
            'performance.totalJobsAssigned': leaderboardData.totalJobsAssigned || 0,
            'performance.onTimeArrivalRate': leaderboardData.onTimeArrivalRate || 0,
            'performance.jobCompletionRate': leaderboardData.jobCompletionRate || 0,
            'performance.ghostedJobs': leaderboardData.ghostedJobs || 0,
            'overallScore': overallScore
        });

    } catch (error) {
        console.error('Error updating leaderboard stats:', error);
    }
};

// Calculate overall score for ranking
const calculateOverallScore = (data) => {
    let score = 0;
    
    // Job completion (40% weight)
    score += (data.jobCompletionRate || 0) * 0.4;
    
    // On-time arrival (25% weight)
    score += (data.onTimeArrivalRate || 0) * 0.25;
    
    // Total jobs completed bonus (20% weight)
    score += Math.min((data.totalJobsCompleted || 0) * 2, 20);
    
    // Penalty for ghosted jobs
    score -= (data.ghostedJobs || 0) * 10;
    
    return Math.max(0, Math.round(score));
};

// Export function for updating technician performance when job is paid
export const updateTechnicianPerformance = async (technicianId) => {
    try {
        await updateLeaderboardStats(technicianId);
    } catch (error) {
        console.error('Error updating technician performance:', error);
    }
};
