import mongoose from "mongoose";

const companyUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    teams: [{
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team"
        },
        role: {
            type: String,
            enum: ["Manager", "Member", "Viewer"],
            default: "Member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ["active", "inactive", "pending", "suspended"],
        default: "pending"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    invitationToken: {
        type: String
    },
    invitationExpires: {
        type: Date
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    permissions: {
        // Override permissions from role if needed
        canOverrideRolePermissions: { type: Boolean, default: false },
        customPermissions: {
            type: Map,
            of: Boolean,
            default: {}
        }
    },
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            showProfile: { type: Boolean, default: true },
            showContactInfo: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

// Indexes for efficient queries
companyUserSchema.index({ userId: 1, companyId: 1 }, { unique: true });
companyUserSchema.index({ companyId: 1, status: 1 });
companyUserSchema.index({ roleId: 1 });
companyUserSchema.index({ "teams.teamId": 1 });

// Virtual for full user details
companyUserSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual for role details
companyUserSchema.virtual('role', {
    ref: 'Role',
    localField: 'roleId',
    foreignField: '_id',
    justOne: true
});

// Virtual for company details
companyUserSchema.virtual('company', {
    ref: 'Company',
    localField: 'companyId',
    foreignField: '_id',
    justOne: true
});

// Ensure virtual fields are serialized
companyUserSchema.set('toJSON', { virtuals: true });
companyUserSchema.set('toObject', { virtuals: true });

export const CompanyUser = mongoose.model("CompanyUser", companyUserSchema);

