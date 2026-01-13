import mongoose from "mongoose";

const companyUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // No ref - belongs to Auth Service
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // No ref - belongs to this service
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // No ref - belongs to this service
    },
    teams: [{
        teamId: {
            type: mongoose.Schema.Types.ObjectId
            // No ref - belongs to this service
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
        type: mongoose.Schema.Types.ObjectId
        // No ref - belongs to Auth Service
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

companyUserSchema.index({ userId: 1, companyId: 1 }, { unique: true });
companyUserSchema.index({ companyId: 1, status: 1 });
companyUserSchema.index({ roleId: 1 });
companyUserSchema.index({ "teams.teamId": 1 });

export const CompanyUser = mongoose.model("CompanyUser", companyUserSchema);
