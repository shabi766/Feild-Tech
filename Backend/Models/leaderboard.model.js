import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
    // Technician reference
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Basic stats
    totalJobsCompleted: {
        type: Number,
        default: 0
    },
    
    totalJobsAssigned: {
        type: Number,
        default: 0
    },
    
    // Rating stats
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    totalReviews: {
        type: Number,
        default: 0
    },
    
    ratingBreakdown: {
        fiveStar: { type: Number, default: 0 },
        fourStar: { type: Number, default: 0 },
        threeStar: { type: Number, default: 0 },
        twoStar: { type: Number, default: 0 },
        oneStar: { type: Number, default: 0 }
    },
    
    // Performance metrics
    onTimeArrivalRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    jobCompletionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    averageResponseTime: {
        type: Number, // in minutes
        default: 0
    },
    
    // Negative metrics
    ghostedJobs: {
        type: Number,
        default: 0
    },
    
    cancelledJobs: {
        type: Number,
        default: 0
    },
    
    // Calculated score for ranking
    overallScore: {
        type: Number,
        default: 0
    },
    
    // Ranking
    rank: {
        type: Number,
        default: 0
    },
    
    // Previous rank for tracking changes
    previousRank: {
        type: Number,
        default: 0
    },
    
    // Categories for specialized rankings
    categories: [{
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        rank: { type: Number, default: 0 }
    }],
    
    // Achievement badges
    badges: [{
        name: { type: String, required: true },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now },
        icon: { type: String }
    }],
    
    // Last updated
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
leaderboardSchema.index({ overallScore: -1 });
leaderboardSchema.index({ rank: 1 });
leaderboardSchema.index({ technicianId: 1 });

// Virtual for completion percentage
leaderboardSchema.virtual('completionPercentage').get(function() {
    if (this.totalJobsAssigned === 0) return 0;
    return Math.round((this.totalJobsCompleted / this.totalJobsAssigned) * 100);
});

// Virtual for reliability score
leaderboardSchema.virtual('reliabilityScore').get(function() {
    const baseScore = this.onTimeArrivalRate * 0.4 + this.jobCompletionRate * 0.6;
    const penalty = (this.ghostedJobs + this.cancelledJobs) * 10;
    return Math.max(0, baseScore - penalty);
});

// Ensure virtual fields are serialized
leaderboardSchema.set('toJSON', { virtuals: true });
leaderboardSchema.set('toObject', { virtuals: true });

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
