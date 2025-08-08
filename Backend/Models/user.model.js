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
            type: Number,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        cnic: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Technician", "Recruiter", "Admin"],
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

        // Preferences
        darkMode: { type: Boolean, default: false },
        notifications: { type: Boolean, default: true },
        
        // Password Reset Fields
        resetPasswordOtp: { type: String },
        resetPasswordOtpExpiry: { type: Date },
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
