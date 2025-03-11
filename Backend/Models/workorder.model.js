import mongoose from "mongoose";

// Address schema
const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
});

// Main workorder schema
const workorderSchema = new mongoose.Schema({
    // Title section
    title: { type: String, required: true },
    template: { type: String, enum: ['Template1', 'Template2', 'Template3'], required: false },
    clientName: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: false },
    projectName: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },

    // New field for identifying individual jobs
    isIndividual: { type: Boolean, default: true },

    // Description section
    description: { type: String, required: true },
    totalSalary: { type: Number, required: true }, 
    
    // Updated salary structure
    salary: {
        // New field for total salary
        partTime: {
            hourlyRate: { type: Number, required: false },
            dailyRate: { type: Number, required: false },
            contractRate: { type: Number, required: false }
        },
        fullTime: {
            monthlySalary: { type: Number, required: false }
        }
    },

    requiredTools: { type: [String], required: false },
    skills: { type: [String], required: true },

    // Job type section
    jobType: { type: String, enum: ['part-time', 'full-time'], required: true },
    partTimeOptions: {
        type: {
            base: { type: String, enum: ['hourly', 'daily', 'contract'], required: false },
            hourlyHours: { type: Number, required: false },
            dailyDays: { type: Number, required: false },
            contractMonths: { type: Number, required: false }
        },
        required: false
    },
    fullTimeOptions: {
        type: {
            base: { type: String, enum: ['permanent', 'contract'], required: false },
            contractMonths: { type: Number, required: false }
        },
        required: false
    },
    
    // Field for tracking the total time set for the job
    totalJobTime: { type: String, enum: ['hours', 'days', 'weeks', 'months'], required: false },
    totalJobDuration: { type: String,  required: false  },
    
    // Location section
    location: { type: addressSchema, required: true },

    // Metadata
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Application: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    assignedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    Company: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],

    // Time fields
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // Status field
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Assigned', 'Checkin', 'Checkout', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'],
        default: 'Draft',
        required: true
    },
    checkinRequired: {type: Boolean, default: false},
    checkoutRequired: {type: Boolean, default: false},
    checkinTime: {type: Date, default: null},
    checkoutTime: {type: Date, default: null},
    doneTime: {type: Date, default: null},
    completeTime: {type: Date, default: null},
    paidTime: {type: Date, default: null},
}, { timestamps: true });

export const Workorder = mongoose.model("Workorder", workorderSchema);
