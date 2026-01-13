import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        cnic: {
            type: String,
            required: function() {
                // CNIC is only required for individual users, not company recruiters or company owners
                return this.role !== "Recruiter" && this.role !== "Company";
            },
        },
        role: {
            type: String,
            enum: ["Technician", "Recruiter", "Admin", "Company"], // Added "Company" for company owners
        },
        // New field to track recruiter registration type
        recruiterType: {
            type: String,
            enum: ["Individual", "Company"],
            default: undefined // Only set for Recruiters
        },
        // Company ID for company recruiters
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: undefined // Only set for Company Recruiters
        },
        profile: {
            bio: { type: String },
            skills: [{ type: String }],
            resume: { type: String },
            resumeOriginalName: { type: String },
            company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
            profilePhoto: {
                type: String,
                default: "/default-avatar.png",
            },
        },
        status: { type: String, enum: ["online", "away", "offline"], default: "offline" },
        lastSeen: { type: Date, default: Date.now },
        chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // New personal info
        age: { type: Number },
        gender: { type: String, enum: ["Male", "Female", "Other"], default: undefined },
        address: { type: addressSchema, default: {} },

        // Documents (legacy)
        cnicImages: [{ type: String }],
        certificationImages: [{ type: String }],
        achievementImages: [{ type: String }],

        // New structure
        achievements: [{ type: String }],
        certifications: [certificationSchema],
        courses: [{ type: String }],
        
        // Social Links
        socialLinks: {
            linkedin: { type: String },
            twitter: { type: String },
            github: { type: String }
        },

        // KYC fields for in-app onboarding
        kyc: {
            fatherName: { type: String },
            cnicFrontUrl: { type: String },
            cnicBackUrl: { type: String },
            cnicNumber: { type: String },
            dateOfBirth: { type: Date },
            kycStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
            remarks: { type: String },
        },

        // Preferences
        darkMode: { type: Boolean, default: false },
        notifications: { type: Boolean, default: true },
        
        // User Settings
        settings: {
            language: { type: String, enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ko', 'ur'], default: 'en' },
            currency: { type: String, enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'], default: 'USD' },
            timezone: { type: String, default: 'UTC' },
            dateFormat: { type: String, enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' },
            timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
            weekStart: { type: String, enum: ['monday', 'sunday'], default: 'monday' }
        },
        
        // Privacy Settings
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'registered', 'private'], default: 'public' },
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false },
            allowMessages: { type: Boolean, default: true },
            showOnlineStatus: { type: Boolean, default: true },
            showLastSeen: { type: Boolean, default: true }
        },
        
        // Notification Preferences
        notificationPreferences: {
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            marketingEmails: { type: Boolean, default: false },
            jobAlerts: { type: Boolean, default: true },
            messageAlerts: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true },
            paymentNotifications: { type: Boolean, default: true }
        },
        
        // Password Reset Fields
        resetPasswordOtp: { type: String },
        resetPasswordOtpExpiry: { type: Date },

        // Stripe / Wallet fields
        stripe: {
            customerId: { type: String, default: null }, // Recruiters store customer for charging
            connectAccountId: { type: String, default: null }, // Technicians receive payouts
            connectChargesEnabled: { type: Boolean, default: false },
            detailsSubmitted: { type: Boolean, default: false },
        },
        // Optional local wallet balance cache (authoritative balance is on Stripe)
        walletBalance: { type: Number, default: 0 },
        
        // Rating and Review fields (for technicians)
        rating: {
            averageRating: { type: Number, default: 0, min: 0, max: 5 },
            totalReviews: { type: Number, default: 0 },
            ratingBreakdown: {
                fiveStar: { type: Number, default: 0 },
                fourStar: { type: Number, default: 0 },
                threeStar: { type: Number, default: 0 },
                twoStar: { type: Number, default: 0 },
                oneStar: { type: Number, default: 0 }
            }
        },
        
        // Performance metrics (for technicians)
        performance: {
            totalJobsCompleted: { type: Number, default: 0 },
            totalJobsAssigned: { type: Number, default: 0 },
            onTimeArrivalRate: { type: Number, default: 0, min: 0, max: 100 },
            jobCompletionRate: { type: Number, default: 0, min: 0, max: 100 },
            ghostedJobs: { type: Number, default: 0 },
            cancelledJobs: { type: Number, default: 0 },
            averageResponseTime: { type: Number, default: 0 } // in minutes
        },
        
        // Leaderboard ranking
        leaderboardRank: { type: Number, default: 0 },
        overallScore: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
