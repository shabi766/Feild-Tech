import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    Workorder: {  
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // No ref - belongs to Workorder Service
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // No ref - belongs to Auth Service
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'rejected'],
        default: 'pending'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    }
}, { timestamps: true });

// Indexes for performance
applicationSchema.index({ Workorder: 1, applicant: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });

export const Application = mongoose.model("Application", applicationSchema);
