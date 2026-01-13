import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Job reference
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workorder',
        required: true
    },
    
    // Who is being reviewed (technician)
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Who is giving the review (recruiter/client)
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Rating (1-5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    
    // Review text
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    
    // Review categories
    categories: [{
        type: String,
        enum: ['punctuality', 'quality', 'communication', 'professionalism', 'problem_solving', 'teamwork']
    }],
    
    // Job completion metrics
    metrics: {
        onTimeArrival: { type: Boolean, default: true },
        jobCompletedOnTime: { type: Boolean, default: true },
        qualityOfWork: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        professionalism: { type: Number, min: 1, max: 5 }
    },
    
    // Review status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    
    // Moderation
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: { type: Date },
    moderationNotes: { type: String },
    
    // Flags
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    
    // Helpful votes
    helpfulVotes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes for efficient queries
reviewSchema.index({ technicianId: 1, createdAt: -1 });
reviewSchema.index({ jobId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
    if (this.totalVotes === 0) return 0;
    return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

export const Review = mongoose.model("Review", reviewSchema);
