import { Leaderboard } from '../Models/leaderboard.model.js';
import { User } from '../Models/user.model.js';
import { Review } from '../Models/review.model.js';
import { Workorder } from '../Models/workorder.model.js';

// Get global leaderboard
export const getGlobalLeaderboard = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, sortBy = 'overallScore' } = req.query;
        const skip = (page - 1) * limit;

        // Build sort
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

        // Build filter
        let filter = {};
        if (category) {
            filter['categories.name'] = category;
        }

        const leaderboard = await Leaderboard.find(filter)
            .populate('technicianId', 'fullname profile.photo profile.skills')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Leaderboard.countDocuments(filter);

        // Calculate ranks
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry.toObject(),
            rank: skip + index + 1
        }));

        return res.status(200).json({
            leaderboard: rankedLeaderboard,
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

// Get category-specific leaderboard
export const getCategoryLeaderboard = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const leaderboard = await Leaderboard.find({
            'categories.name': category
        })
        .populate('technicianId', 'fullname profile.photo profile.skills')
        .sort({ 'categories.$.score': -1, overallScore: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Leaderboard.countDocuments({
            'categories.name': category
        });

        // Calculate ranks
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry.toObject(),
            rank: skip + index + 1
        }));

        return res.status(200).json({
            leaderboard: rankedLeaderboard,
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

// Get top performers
export const getTopPerformers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topPerformers = await Leaderboard.find({})
            .populate('technicianId', 'fullname profile.photo profile.skills')
            .sort({ overallScore: -1, averageRating: -1 })
            .limit(parseInt(limit));

        // Calculate ranks
        const rankedTopPerformers = topPerformers.map((entry, index) => ({
            ...entry.toObject(),
            rank: index + 1
        }));

        return res.status(200).json({
            topPerformers: rankedTopPerformers,
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

// Get technician's ranking and stats
export const getTechnicianRanking = async (req, res) => {
    try {
        const { technicianId } = req.params;

        // First try to get from Leaderboard
        let leaderboardEntry = await Leaderboard.findOne({ technicianId })
            .populate('technicianId', 'fullname profile.photo profile.skills');

        // If no leaderboard entry, get from User model as fallback
        if (!leaderboardEntry) {
            const user = await User.findById(technicianId);
            if (!user) {
                return res.status(404).json({
                    message: 'Technician not found',
                    success: false
                });
            }

            // Create a fallback leaderboard entry from user data
            leaderboardEntry = {
                technicianId: user,
                overallScore: user.performance?.overallScore || 0,
                averageRating: user.performance?.averageRating || 0,
                totalReviews: user.performance?.totalReviews || 0,
                totalJobsCompleted: user.performance?.totalJobsCompleted || 0,
                onTimeArrivalRate: user.performance?.onTimeArrivalRate || 0,
                jobCompletionRate: user.performance?.jobCompletionRate || 0,
                ghostedJobs: user.performance?.ghostedJobs || 0,
                cancelledJobs: user.performance?.cancelledJobs || 0,
                averageResponseTime: user.performance?.averageResponseTime || 0
            };
        }

        // Get rank from leaderboard or calculate approximate rank
        let rank;
        if (leaderboardEntry._id) {
            // If we have a real leaderboard entry, get exact rank
            rank = await Leaderboard.countDocuments({
                overallScore: { $gt: leaderboardEntry.overallScore }
            });
        } else {
            // Calculate approximate rank based on overall score
            rank = await Leaderboard.countDocuments({
                overallScore: { $gt: leaderboardEntry.overallScore }
            });
        }

        // Get nearby competitors (only if we have a real leaderboard entry)
        let nearbyCompetitors = [];
        if (leaderboardEntry._id) {
            nearbyCompetitors = await Leaderboard.find({
                overallScore: {
                    $gte: leaderboardEntry.overallScore - 10,
                    $lte: leaderboardEntry.overallScore + 10
                }
            })
            .populate('technicianId', 'fullname profile.photo')
            .sort({ overallScore: -1 })
            .limit(5);
        }

        return res.status(200).json({
            ranking: {
                rank: rank + 1,
                totalParticipants: await Leaderboard.countDocuments(),
                overallScore: leaderboardEntry.overallScore,
                previousRank: leaderboardEntry.previousRank || null
            },
            stats: leaderboardEntry,
            nearbyCompetitors,
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

// Update leaderboard rankings (called periodically or after significant changes)
export const updateLeaderboardRankings = async (req, res) => {
    try {
        // Get all leaderboard entries sorted by overall score
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

        // Update user models with new ranks
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            await User.findByIdAndUpdate(entry.technicianId, {
                leaderboardRank: i + 1
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

// Get leaderboard statistics
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

        // Get score distribution
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

        // Get top categories
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

// Get trending technicians (biggest rank improvements)
export const getTrendingTechnicians = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const trending = await Leaderboard.find({
            previousRank: { $gt: 0 },
            rank: { $lt: '$previousRank' }
        })
        .populate('technicianId', 'fullname profile.photo profile.skills')
        .sort({ 
            $expr: { $subtract: ['$previousRank', '$rank'] }
        })
        .limit(parseInt(limit));

        const trendingWithImprovement = trending.map(entry => ({
            ...entry.toObject(),
            rankImprovement: entry.previousRank - entry.rank
        }));

        return res.status(200).json({
            trendingTechnicians: trendingWithImprovement,
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
