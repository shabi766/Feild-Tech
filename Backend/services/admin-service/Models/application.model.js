import mongoose from "mongoose";

// Temporary Application model for Admin Service
// TODO: Replace with Application Service client when Application Service is created
const applicationSchema = new mongoose.Schema({
    Workorder: {  
        type: mongoose.Schema.Types.ObjectId,
        // No ref: 'Workorder' - Workorder belongs to Workorder Service
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        // No ref: 'User' - User belongs to Auth Service
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
