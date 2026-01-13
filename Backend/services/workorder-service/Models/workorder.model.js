import mongoose from "mongoose";

// Address schema
const addressSchema = new mongoose.Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
});

const taskSchema = new mongoose.Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

// Main workorder schema
const workorderSchema = new mongoose.Schema({
    // Title section
    title: { type: String },
    template: { type: String },
    // Store IDs only, no refs to other services
    clientName: { type: mongoose.Schema.Types.ObjectId }, // No ref: 'Client' - belongs to Client Service
    projectName: { type: mongoose.Schema.Types.ObjectId }, // No ref: 'Project' - belongs to Client Service
    IncidentID: { type: String },
    Teams: { type: String },

    // New field for identifying individual jobs
    isIndividual: { type: Boolean, default: true },

    // Description section
    description: { type: String },
    confidential: { type: String },
    totalSalary: { type: Number },

    requiredTools: { type: [String] },
    skills: { type: [String] },

    // Job type section
    jobType: { type: String, enum: ['part-time', 'full-time'] },
    partTimeOptions: {
        type: {
            base: { type: String, enum: ['hourly', 'daily', 'contract', 'weekly'] },
            hourlyHours: { type: Number },
            dailyDays: { type: Number },
            contractMonths: { type: Number },
            weeklyDays: { type: Number }
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

    // Metadata - Store IDs only, no refs
    created_by: { type: mongoose.Schema.Types.ObjectId }, // No ref: 'User' - belongs to Auth Service
    Application: [{ type: mongoose.Schema.Types.ObjectId }], // No ref: 'Application' - belongs to Application Service
    assignedApplicant: { type: mongoose.Schema.Types.ObjectId, default: null }, // No ref: "User" - belongs to Auth Service
    Company: [{ type: mongoose.Schema.Types.ObjectId }], // No ref: 'Company' - belongs to Company Service

    siteContact: { type: String },
    SecondaryContact: { type: String },

    // Time fields
    startTime: { type: Date },
    endTime: { type: Date },
    checkinTime: { type: Date },
    checkoutTime: { type: Date },

    // Status field
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'],
        default: 'Draft'
    },
    checkinRequired: { type: Boolean, default: false },
    checkoutRequired: { type: Boolean, default: false },
    checkinTimes: [{ type: Date }],
    checkoutTimes: [{ type: Date }],

    doneTime: { type: Date, default: null },
    completeTime: { type: Date, default: null },
    paidTime: { type: Date, default: null },
    timeSpent: { type: Number, default: null },
    
    // Work order completion requirements
    workOrderNotes: { type: String, default: null },
    workOrderDeliverables: [{ type: String }],
    workOrderImages: [{ type: String }], // URLs to uploaded images
    completionRequirements: {
        notesRequired: { type: Boolean, default: true },
        imagesRequired: { type: Boolean, default: true },
        deliverablesRequired: { type: Boolean, default: false }
    },
    salary: {
        type: {
            partTime: {
                hourlyRate: { type: Number },
                dailyRate: { type: Number },
                contractRate: { type: Number },
                weeklyRate: { type: Number },
            },
            fixed: { type: Number }
        }
    },
    payableHours: { type: Number },
    payableSalary: { type: Number },
    attachments: [{
        name: { type: String },
        url: { type: String }
    }],

    // Voice notes for job descriptions
    voiceNotes: [{
        id: { type: String, required: true },
        audioBlob: { type: String }, // Base64 encoded audio or URL
        duration: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        size: { type: Number }, // Size in bytes
        uploadedBy: { type: mongoose.Schema.Types.ObjectId } // No ref: 'User' - belongs to Auth Service
    }],

    customFields: [
        {
            id: { type: String },
            label: { type: String},
            value: { type: String },
            type: { type: String },
            options: [
                {
                    label: { type: String },
                    value: { type: String }
                }
            ]
        }
    ],
    tasks: [taskSchema],
    shipments: [
        {
            shipmentNumber: { type: String },
            status: { type: String },
            picture: { type: String }, // To store the S3 URL
            trackingId: { type: String },
        },
    ],
    selectionRules: {
        requiredSkills: [String],
        requiredDegrees: [String],
        requiredCertifications: [String],
        requiredTools: [String],
        minimumExperience: { type: Number },
        mustHavePortfolio: { type: Boolean }
    },
    auditRules: [
        {
            description: { type: String},
            weight: { type: Number },
            isRequired: { type: Boolean, default: false },
        }
    ],
}, { timestamps: true });

export const Workorder = mongoose.model("Workorder", workorderSchema);
