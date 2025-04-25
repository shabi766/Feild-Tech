import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    Workorder: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workorder',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);
