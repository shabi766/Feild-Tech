import mongoose from "mongoose";

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
            enum: ["Technician", "Recruiter"],
        },
        profile: {
            bio: { type: String },
            skills: [{ type: String }],
            resume: { type: String }, // URL to resume file
            resumeOriginalName: { type: String },
            company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
            profilePhoto: {
                type: String,
                default: "/default-avatar.png", // ✅ Default profile picture
            },
        },
        status: { type: String, enum: ["online", "away", "offline"], default: "offline" },
        lastSeen: { type: Date, default: Date.now }, // ✅ Last Seen Timestamp
        chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // ✅ New Fields
        darkMode: { type: Boolean, default: false }, // Dark mode toggle
        notifications: { type: Boolean, default: true }, // Notifications toggle
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
