import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    ratedEntity: {
        type: String,
        enum: ['technician', 'company', 'job'],
        required: true,
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    workorderId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    categories: {
        quality: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        professionalism: { type: Number, min: 1, max: 5 },
        timeliness: { type: Number, min: 1, max: 5 }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    response: {
        text: { type: String, maxlength: 500 },
        respondedAt: Date
    },
    helpful: {
        type: Number,
        default: 0
    },
    reported: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound indexes for efficient queries
ratingSchema.index({ entityId: 1, ratedEntity: 1 });
ratingSchema.index({ ratedBy: 1, createdAt: -1 });
ratingSchema.index({ workorderId: 1 });
ratingSchema.index({ rating: -1 });

// Prevent duplicate ratings for the same workorder
ratingSchema.index({ entityId: 1, ratedBy: 1, workorderId: 1 }, { unique: true, sparse: true });

// Virtual for average category rating
ratingSchema.virtual('categoryAverage').get(function () {
    if (!this.categories) return null;
    const values = Object.values(this.categories).filter(v => v != null);
    if (values.length === 0) return null;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
});

ratingSchema.set('toJSON', { virtuals: true });
ratingSchema.set('toObject', { virtuals: true });

export const Rating = mongoose.model('Rating', ratingSchema);
