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
    // add more fields here, like assignedTo, dueDate, etc.
});

// Main workorder schema
const workorderSchema = new mongoose.Schema({
    // Title section
    title: { type: String },
    template: { type: String },
    clientName: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    projectName: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    IncidentID: { type: String },
    Teams: { type: String },

    // New field for identifying individual jobs
    isIndividual: { type: Boolean, default: true },

    // Description section
    description: { type: String },
    confidential: { type: String },
    totalSalary: { type: Number }, // Simplified to just totalSalary

    requiredTools: { type: [String] },
    skills: { type: [String] },

    // Job type section
    jobType: { type: String, enum: ['part-time', 'full-time'] },
    partTimeOptions: {
        type: {
            base: { type: String, enum: ['hourly', 'daily', 'contract', 'weekly'] }, //Added weekly base
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

    // Metadata
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Application: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    assignedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    Company: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],

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
    shipments: [ // Add this array of shipment objects
        {
            shipmentNumber: { type: String },
            status: { type: String },
            picture: { type: String }, // To store the S3 URL
            trackingId: { type: String },
        },
    ],
    selectionRules: { // New field for selection rules
        requiredSkills: [String],
        requiredDegrees: [String],
        requiredCertifications: [String],
        requiredTools: [String],
        minimumExperience: { type: Number },
        mustHavePortfolio: { type: Boolean }
        // Add more rules here based on your SelectionRules component
    },
    auditRules: [ // New field for Smart Audit rules
        {
            description: { type: String},
            weight: { type: Number }, // Example validation
            isRequired: { type: Boolean, default: false },
            // Add more fields as needed (e.g., type of check, expected value, etc.)
        }
    ],
}, { timestamps: true });

export const Workorder = mongoose.model("Workorder", workorderSchema);