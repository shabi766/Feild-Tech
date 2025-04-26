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
    // Contacts array
    siteContact: { type: String },  //  Simple text field
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

    // Modified to store arrays of check-in and check-out times
    checkinTimes: [{ type: Date }],
    checkoutTimes: [{ type: Date }],

    doneTime: { type: Date, default: null },
    completeTime: { type: Date, default: null },
    paidTime: { type: Date, default: null },
    timeSpent: { type: Number, default: null },
    // New salary field
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

    // Attachments field
    attachments: [{
        name: { type: String },
        url: { type: String }
    }],
    // Custom Fields
    customFields: [
        {
            id: { type: String, required: true },
            label: { type: String, required: true },
            value: { type: String, required: true },
             type: { type: String, required: true },  // Store the type of custom field
            options: [
              {
                label: { type: String },
                value: { type: String }
              }
            ]
        }
    ],
}, { timestamps: true });

export const Workorder = mongoose.model("Workorder", workorderSchema);
