import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["Manager", "Member", "Viewer"],
        default: "Member"
    },
    permissions: {
        canCreateJobs: { type: Boolean, default: false },
        canAssignJobs: { type: Boolean, default: false },
        canManageTeam: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: true },
        canManageProjects: { type: Boolean, default: false },
        canManageClients: { type: Boolean, default: false },
        canManageBudget: { type: Boolean, default: false },
        canInviteUsers: { type: Boolean, default: false }
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [teamMemberSchema],
    maxMembers: {
        type: Number,
        default: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        allowMemberInvites: { type: Boolean, default: false },
        requireApprovalForJoining: { type: Boolean, default: true },
        allowPublicVisibility: { type: Boolean, default: false }
    },
    tags: [String],
    color: {
        type: String,
        default: "#3B82F6" // Default blue color
    }
}, { timestamps: true });

// Indexes for efficient queries
teamSchema.index({ companyId: 1, isActive: 1 });
teamSchema.index({ "members.userId": 1 });
teamSchema.index({ createdBy: 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
    return this.members.filter(member => member.isActive).length;
});

// Virtual for active members
teamSchema.virtual('activeMembers').get(function() {
    return this.members.filter(member => member.isActive);
});

// Ensure virtual fields are serialized
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

export const Team = mongoose.model("Team", teamSchema);

