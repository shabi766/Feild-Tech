import mongoose from 'mongoose';
import { Leaderboard } from '../Models/leaderboard.model.js';
import { Review } from '../Models/review.model.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { WorkorderServiceClient } from '../Services/workorder-client.service.js';

/**
 * Get global leaderboard
 */
export const getGlobalLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, sortBy = 'overallScore' } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const skip = (page - 1) * limit;

        let sort = {};
        if (sortBy === 'rating') {
            sort = { averageRating: -1, totalReviews: -1 };
        } else if (sortBy === 'jobs') {
            sort = { totalJobsCompleted: -1, overallScore: -1 };
        } else if (sortBy === 'reliability') {
            sort = { onTimeArrivalRate: -1, jobCompletionRate: -1 };
        } else {
            sort = { overallScore: -1, averageRating: -1 };
        }

        let filter = {};
        if (category) {
            filter['categories.name'] = category;
        }

        const leaderboard = await Leaderboard.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Enrich with technician data
        const enrichedLeaderboard = await Promise.all(
            leaderboard.map(async (entry, index) => {
                try {
                    const technician = await AuthServiceClient.getUser(entry.technicianId, token);
                    return {
                        ...entry.toObject(),
                        rank: skip + index + 1,
                        technician: technician ? {
                            _id: technician._id,
                            fullname: technician.fullname,
                            profile: technician.profile
                        } : null
                    };
                } catch (error) {
                    console.error('Error enriching leaderboard entry:', error);
                    return {
                        ...entry.toObject(),
                        rank: skip + index + 1
                    };
                }
            })
        );

        const total = await Leaderboard.countDocuments(filter);

        return res.status(200).json({
            leaderboard: enrichedLeaderboard,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalEntries: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            success: true
        });

    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get category-specific leaderboard
 */
export const getCategoryLeaderboard = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const skip = (page - 1) * limit;

        const leaderboard = await Leaderboard.find({
            'categories.name': category
        })
            .sort({ 'categories.$.score': -1, overallScore: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const enrichedLeaderboard = await Promise.all(
            leaderboard.map(async (entry, index) => {
                try {
                    const technician = await AuthServiceClient.getUser(entry.technicianId, token);
                    return {
                        ...entry.toObject(),
                        rank: skip + index + 1,
                        technician: technician ? {
                            _id: technician._id,
                            fullname: technician.fullname,
                            profile: technician.profile
                        } : null
                    };
                } catch (error) {
                    return {
                        ...entry.toObject(),
                        rank: skip + index + 1
                    };
                }
            })
        );

        const total = await Leaderboard.countDocuments({
            'categories.name': category
        });

        return res.status(200).json({
            leaderboard: enrichedLeaderboard,
            category,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalEntries: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            success: true
        });

    } catch (error) {
        console.error('Error fetching category leaderboard:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get top performers
 */
export const getTopPerformers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const topPerformers = await Leaderboard.find({})
            .sort({ overallScore: -1, averageRating: -1 })
            .limit(parseInt(limit));

        const enrichedPerformers = await Promise.all(
            topPerformers.map(async (entry, index) => {
                try {
                    const technician = await AuthServiceClient.getUser(entry.technicianId, token);
                    return {
                        ...entry.toObject(),
                        rank: index + 1,
                        technician: technician ? {
                            _id: technician._id,
                            fullname: technician.fullname,
                            profile: technician.profile
                        } : null
                    };
                } catch (error) {
                    return {
                        ...entry.toObject(),
                        rank: index + 1
                    };
                }
            })
        );

        return res.status(200).json({
            topPerformers: enrichedPerformers,
            success: true
        });

    } catch (error) {
        console.error('Error fetching top performers:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get technician's ranking and stats
 */
export const getTechnicianRanking = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        let leaderboardEntry = await Leaderboard.findOne({ technicianId });

        if (!leaderboardEntry) {
            // Create a fallback entry
            leaderboardEntry = {
                technicianId,
                overallScore: 0,
                averageRating: 0,
                totalReviews: 0,
                totalJobsCompleted: 0,
                onTimeArrivalRate: 0,
                jobCompletionRate: 0,
                ghostedJobs: 0,
                cancelledJobs: 0,
                averageResponseTime: 0
            };
        }

        // Get rank
        const rank = await Leaderboard.countDocuments({
            overallScore: { $gt: leaderboardEntry.overallScore }
        });

        // Get nearby competitors
        const nearbyCompetitors = await Leaderboard.find({
            overallScore: {
                $gte: leaderboardEntry.overallScore - 10,
                $lte: leaderboardEntry.overallScore + 10
            }
        })
            .sort({ overallScore: -1 })
            .limit(5);

        const enrichedCompetitors = await Promise.all(
            nearbyCompetitors.map(async (entry) => {
                try {
                    const technician = await AuthServiceClient.getUser(entry.technicianId, token);
                    return {
                        ...entry.toObject(),
                        technician: technician ? {
                            _id: technician._id,
                            fullname: technician.fullname,
                            profile: technician.profile
                        } : null
                    };
                } catch (error) {
                    return entry.toObject();
                }
            })
        );

        return res.status(200).json({
            ranking: {
                rank: rank + 1,
                totalParticipants: await Leaderboard.countDocuments(),
                overallScore: leaderboardEntry.overallScore,
                previousRank: leaderboardEntry.previousRank || null
            },
            stats: leaderboardEntry,
            nearbyCompetitors: enrichedCompetitors,
            success: true
        });

    } catch (error) {
        console.error('Error fetching technician ranking:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Update leaderboard rankings (called periodically or after significant changes)
 */
export const updateLeaderboardRankings = async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find({})
            .sort({ overallScore: -1, averageRating: -1 });

        // Update ranks
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const newRank = i + 1;

            await Leaderboard.findByIdAndUpdate(entry._id, {
                previousRank: entry.rank,
                rank: newRank
            });
        }

        return res.status(200).json({
            message: 'Leaderboard rankings updated successfully',
            totalEntries: leaderboard.length,
            success: true
        });

    } catch (error) {
        console.error('Error updating leaderboard rankings:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Update technician stats (called by Review Service or Workorder Service)
 */
export const updateTechnicianStats = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        // Get review stats using direct DB aggregation (Service Consolidation)
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

        const reviewStats = stats.length > 0 ? stats[0] : { totalReviews: 0, averageRating: 0, ratingBreakdown: {} };

        // Get workorder stats (would need workorder service to provide this)
        // For now, we'll calculate from existing leaderboard entry

        let leaderboardEntry = await Leaderboard.findOne({ technicianId });

        if (!leaderboardEntry) {
            leaderboardEntry = new Leaderboard({ technicianId });
        }

        // Update from review stats
        if (reviewStats.totalReviews !== undefined) {
            leaderboardEntry.totalReviews = reviewStats.totalReviews;
            leaderboardEntry.averageRating = reviewStats.averageRating || 0;
            leaderboardEntry.ratingBreakdown = reviewStats.ratingBreakdown || {};
        }

        // Calculate overall score
        const overallScore = calculateOverallScore(leaderboardEntry);
        leaderboardEntry.overallScore = overallScore;
        leaderboardEntry.lastUpdated = new Date();

        await leaderboardEntry.save();

        // Update rankings
        // Note: calling the controller function directly here requires mocking req/res if we reused the wrapper. 
        // Better to just call the logic. For now spawning a background update without waiting
        // or just let the next scheduled update handle it to avoid recursion issues.

        return res.status(200).json({
            message: 'Technician stats updated successfully',
            leaderboard: leaderboardEntry,
            success: true
        });

    } catch (error) {
        console.error('Error updating technician stats:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get leaderboard statistics
 */
export const getLeaderboardStats = async (req, res) => {
    try {
        const stats = await Leaderboard.aggregate([
            {
                $group: {
                    _id: null,
                    totalParticipants: { $sum: 1 },
                    averageScore: { $avg: '$overallScore' },
                    highestScore: { $max: '$overallScore' },
                    lowestScore: { $min: '$overallScore' },
                    averageRating: { $avg: '$averageRating' },
                    totalJobsCompleted: { $sum: '$totalJobsCompleted' },
                    averageCompletionRate: { $avg: '$jobCompletionRate' }
                }
            }
        ]);

        const scoreDistribution = await Leaderboard.aggregate([
            {
                $bucket: {
                    groupBy: '$overallScore',
                    boundaries: [0, 25, 50, 75, 100, 125, 150, 175, 200],
                    default: '200+',
                    output: {
                        count: { $sum: 1 },
                        technicians: { $push: '$technicianId' }
                    }
                }
            }
        ]);

        const topCategories = await Leaderboard.aggregate([
            { $unwind: '$categories' },
            {
                $group: {
                    _id: '$categories.name',
                    averageScore: { $avg: '$categories.score' },
                    participantCount: { $sum: 1 }
                }
            },
            { $sort: { averageScore: -1 } },
            { $limit: 5 }
        ]);

        return res.status(200).json({
            stats: stats[0] || {},
            scoreDistribution,
            topCategories,
            success: true
        });

    } catch (error) {
        console.error('Error fetching leaderboard stats:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Get trending technicians (biggest rank improvements)
 */
export const getTrendingTechnicians = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const trending = await Leaderboard.find({
            previousRank: { $gt: 0 },
            rank: { $lt: '$previousRank' }
        })
            .sort({
                $expr: { $subtract: ['$previousRank', '$rank'] }
            })
            .limit(parseInt(limit));

        const enrichedTrending = await Promise.all(
            trending.map(async (entry) => {
                try {
                    const technician = await AuthServiceClient.getUser(entry.technicianId, token);
                    return {
                        ...entry.toObject(),
                        rankImprovement: entry.previousRank - entry.rank,
                        technician: technician ? {
                            _id: technician._id,
                            fullname: technician.fullname,
                            profile: technician.profile
                        } : null
                    };
                } catch (error) {
                    return {
                        ...entry.toObject(),
                        rankImprovement: entry.previousRank - entry.rank
                    };
                }
            })
        );

        return res.status(200).json({
            trendingTechnicians: enrichedTrending,
            success: true
        });

    } catch (error) {
        console.error('Error fetching trending technicians:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message
        });
    }
};

/**
 * Helper function to calculate overall score
 */
const calculateOverallScore = (data) => {
    let score = 0;

    // Job completion (40% weight)
    score += (data.jobCompletionRate || 0) * 0.4;

    // On-time arrival (25% weight)
    score += (data.onTimeArrivalRate || 0) * 0.25;

    // Total jobs completed bonus (20% weight)
    score += Math.min((data.totalJobsCompleted || 0) * 2, 20);

    // Average rating bonus (15% weight)
    score += (data.averageRating || 0) * 3;

    // Penalty for ghosted jobs
    score -= (data.ghostedJobs || 0) * 10;

    return Math.max(0, Math.round(score));
};
