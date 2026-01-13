import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    // Job Management
    canCreateJobs: { type: Boolean, default: false },
    canEditJobs: { type: Boolean, default: false },
    canDeleteJobs: { type: Boolean, default: false },
    canAssignJobs: { type: Boolean, default: false },
    canViewAllJobs: { type: Boolean, default: false },
    
    // Team Management
    canCreateTeams: { type: Boolean, default: false },
    canEditTeams: { type: Boolean, default: false },
    canDeleteTeams: { type: Boolean, default: false },
    canManageTeamMembers: { type: Boolean, default: false },
    canInviteUsers: { type: Boolean, default: false },
    canRemoveUsers: { type: Boolean, default: false },
    
    // Project Management
    canCreateProjects: { type: Boolean, default: false },
    canEditProjects: { type: Boolean, default: false },
    canDeleteProjects: { type: Boolean, default: false },
    canAssignProjects: { type: Boolean, default: false },
    canViewAllProjects: { type: Boolean, default: false },
    
    // Client Management
    canCreateClients: { type: Boolean, default: false },
    canEditClients: { type: Boolean, default: false },
    canDeleteClients: { type: Boolean, default: false },
    canViewAllClients: { type: Boolean, default: false },
    
    // Financial Management
    canViewBudget: { type: Boolean, default: false },
    canManageBudget: { type: Boolean, default: false },
    canViewInvoices: { type: Boolean, default: false },
    canCreateInvoices: { type: Boolean, default: false },
    canApprovePayments: { type: Boolean, default: false },
    canAccessMainWallet: { type: Boolean, default: false },
    canCreateSubWallets: { type: Boolean, default: false },
    canTransferFunds: { type: Boolean, default: false },
    canViewAllFinancials: { type: Boolean, default: false },
    
    // Reports and Analytics
    canViewReports: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    
    // User Management
    canViewUsers: { type: Boolean, default: false },
    canEditUsers: { type: Boolean, default: false },
    canDeleteUsers: { type: Boolean, default: false },
    canChangeUserRoles: { type: Boolean, default: false },
    canManageAllUsers: { type: Boolean, default: false },
    canManageAllRoles: { type: Boolean, default: false },
    canManageAllTeams: { type: Boolean, default: false },
    
    // System Settings
    canManageCompanySettings: { type: Boolean, default: false },
    canManageIntegrations: { type: Boolean, default: false },
    canViewAuditLogs: { type: Boolean, default: false },
    canManageSystemSettings: { type: Boolean, default: false },
    
    // Technician Management
    canHireTechnicians: { type: Boolean, default: false },
    canPayTechnicians: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
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
        required: true
        // No ref - belongs to this service
    },
    roleType: {
        type: String,
        enum: ['ADMIN', 'MANAGER', 'RECRUITER', 'COMPANY_OWNER', 'CUSTOM'],
        default: 'CUSTOM'
    },
    isSystemRole: {
        type: Boolean,
        default: false
    },
    permissions: {
        type: permissionSchema,
        default: {}
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
        // No ref - belongs to Auth Service
    },
    color: {
        type: String,
        default: "#6B7280"
    }
}, { timestamps: true });

roleSchema.index({ companyId: 1, isActive: 1 });
roleSchema.index({ name: 1, companyId: 1 }, { unique: true });

export const Role = mongoose.model("Role", roleSchema);
