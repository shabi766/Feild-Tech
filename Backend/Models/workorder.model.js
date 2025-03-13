import mongoose from "mongoose";

// Address schema
const addressSchema = new mongoose.Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
});

// Main workorder schema
const workorderSchema = new mongoose.Schema({
    // Title section
    title: { type: String },
    template: { type: String },
    clientName: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    projectName: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

    // New field for identifying individual jobs
    isIndividual: { type: Boolean, default: true },

    // Description section
    description: { type: String },
    totalSalary: { type: Number },

    // Updated salary structure
    salary: {
        // New field for total salary
        partTime: {
            hourlyRate: { type: Number },
            dailyRate: { type: Number },
            contractRate: { type: Number }
        },
        fullTime: {
            monthlySalary: { type: Number }
        }
    },

    requiredTools: { type: [String] },
    skills: { type: [String] },

    // Job type section
    jobType: { type: String, enum: ['part-time', 'full-time'] },
    partTimeOptions: {
        type: {
            base: { type: String, enum: ['hourly', 'daily', 'contract'] },
            hourlyHours: { type: Number },
            dailyDays: { type: Number },
            contractMonths: { type: Number }
        }
    },
    fullTimeOptions: {
        type: {
            base: { type: String, enum: ['permanent', 'contract'] },
            contractMonths: { type: Number }
        }
    },

    // Field for tracking the total time set for the job
    totalJobTime: { type: String, enum: ['hours', 'days', 'weeks', 'months'] },
    totalJobDuration: { type: String },

    // Location section
    location: { type: addressSchema },

    // Metadata
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Application: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    assignedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    Company: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],

    // Time fields
    startTime: { type: Date },
    endTime: { type: Date },

    // Status field
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'],
        default: 'Draft'
    },
    checkinRequired: { type: Boolean, default: false },
    checkoutRequired: { type: Boolean, default: false },
    checkinTime: { type: Date, default: null },
    checkoutTime: { type: Date, default: null },
    doneTime: { type: Date, default: null },
    completeTime: { type: Date, default: null },
    paidTime: { type: Date, default: null },
    timeSpent: { type: Number, default: null },
}, { timestamps: true });

export const Workorder = mongoose.model("Workorder", workorderSchema);