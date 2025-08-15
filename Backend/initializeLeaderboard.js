import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './Models/user.model.js';
import { Workorder } from './Models/workorder.model.js';
import { Leaderboard } from './Models/leaderboard.model.js';
import { Review } from './Models/review.model.js';

dotenv.config();

const initializeLeaderboard = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MongoDB connection string not found in environment variables');
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all technicians
        const technicians = await User.find({ role: 'Technician' });
        console.log(`Found ${technicians.length} technicians`);

        for (const technician of technicians) {
            try {
                // Get job statistics
                const jobStats = await Workorder.aggregate([
                    { $match: { assignedApplicant: technician._id } },
                    {
                        $group: {
                            _id: null,
                            totalJobsAssigned: { $sum: 1 },
                            totalJobsCompleted: { $sum: { $cond: [{ $in: ['$status', ['Complete', 'Paid']] }, 1, 0] } },
                            ghostedJobs: { $sum: { $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0] } }
                        }
                    }
                ]);

                // Get review statistics
                const reviewStats = await Review.aggregate([
                    { $match: { technicianId: technician._id, status: 'approved' } },
                    {
                        $group: {
                            _id: null,
                            totalReviews: { $sum: 1 },
                            averageRating: { $avg: '$rating' },
                            onTimeArrivalRate: { $avg: { $cond: ['$metrics.onTimeArrival', 100, 0] } },
                            jobCompletionRate: { $avg: { $cond: ['$metrics.jobCompletedOnTime', 100, 0] } }
                        }
                    }
                ]);

                let leaderboardData = {
                    technicianId: technician._id,
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

                if (reviewStats.length > 0) {
                    const reviewStat = reviewStats[0];
                    leaderboardData = {
                        ...leaderboardData,
                        averageRating: Math.round(reviewStat.averageRating * 10) / 10,
                        totalReviews: reviewStat.totalReviews,
                        onTimeArrivalRate: Math.round(reviewStat.onTimeArrivalRate || 0),
                        averageResponseTime: Math.round(reviewStat.jobCompletionRate || 0)
                    };
                }

                // Calculate overall score
                const overallScore = calculateOverallScore(leaderboardData);
                leaderboardData.overallScore = overallScore;

                // Update or create leaderboard entry
                await Leaderboard.findOneAndUpdate(
                    { technicianId: technician._id },
                    leaderboardData,
                    { upsert: true, new: true }
                );

                // Update user model with performance data
                await User.findByIdAndUpdate(technician._id, {
                    'performance.totalJobsCompleted': leaderboardData.totalJobsCompleted || 0,
                    'performance.totalJobsAssigned': leaderboardData.totalJobsAssigned || 0,
                    'performance.onTimeArrivalRate': leaderboardData.onTimeArrivalRate || 0,
                    'performance.jobCompletionRate': leaderboardData.jobCompletionRate || 0,
                    'performance.ghostedJobs': leaderboardData.ghostedJobs || 0,
                    'overallScore': overallScore
                });

                console.log(`Updated leaderboard for ${technician.fullname} - Score: ${overallScore}`);
            } catch (error) {
                console.error(`Error updating technician ${technician.fullname}:`, error);
            }
        }

        // Update rankings
        await updateRankings();
        
        console.log('Leaderboard initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing leaderboard:', error);
        process.exit(1);
    }
};

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

const updateRankings = async () => {
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

            // Update user model with new rank
            await User.findByIdAndUpdate(entry.technicianId, {
                leaderboardRank: newRank
            });
        }

        console.log(`Updated rankings for ${leaderboard.length} technicians`);
    } catch (error) {
        console.error('Error updating rankings:', error);
    }
};

// Run the initialization
initializeLeaderboard();
