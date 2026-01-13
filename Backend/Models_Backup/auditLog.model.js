import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Allow null for anonymous users
            default: null
        },
        userEmail: { type: String, required: true },
        userRole: { type: String, required: true },
        userIp: { type: String, required: true },
        userAgent: { type: String, required: true },
        
        // New field to track if user is anonymous
        isAnonymous: { 
            type: Boolean, 
            required: true, 
            default: false 
        },
        
        action: { type: String, required: true },
        resourceType: { type: String, required: true },
        resourceId: { type: mongoose.Schema.Types.ObjectId, required: false },
        resourceName: { type: String, required: false },
        
        details: { type: mongoose.Schema.Types.Mixed, required: false },
        previousValues: { type: mongoose.Schema.Types.Mixed, required: false },
        newValues: { type: mongoose.Schema.Types.Mixed, required: false },
        
        status: { type: String, required: true, default: 'success' },
        result: { type: String, required: false },
        errorMessage: { type: String, required: false },
        
        sessionId: { type: String, required: false },
        requestId: { type: String, required: false },
        endpoint: { type: String, required: false },
        httpMethod: { type: String, required: false },
        
        responseTime: { type: Number, required: false },
        riskLevel: { type: String, required: true, default: 'low' },
        isSuspicious: { type: Boolean, default: false },
        flags: [{ type: String }],
        
        retentionPeriod: { type: Number, default: 2555 },
        isComplianceRequired: { type: Boolean, default: false },
        complianceTags: [{ type: String }]
    },
    {
        timestamps: true,
        indexes: [
            { userId: 1, createdAt: -1 },
            { isAnonymous: 1, createdAt: -1 },
            { action: 1, createdAt: -1 },
            { resourceType: 1, resourceId: 1 },
            { status: 1, createdAt: -1 },
            { riskLevel: 1, createdAt: -1 },
            { userIp: 1, createdAt: -1 },
            { createdAt: -1 }
        ]
    }
);

// Pre-save middleware to set risk level
auditLogSchema.pre('save', function(next) {
    const highRiskActions = [
        'user_deleted', 'role_changed', 'permissions_updated', 'system_setting_changed',
        'admin_action', 'permission_violation', 'data_modification'
    ];
    
    const criticalRiskActions = [
        'suspicious_activity_detected', 'ip_blocked', 'account_locked', 'data_exfiltration'
    ];
    
    if (criticalRiskActions.includes(this.action)) {
        this.riskLevel = 'critical';
    } else if (highRiskActions.includes(this.action)) {
        this.riskLevel = 'high';
    } else if (['login_failed', 'password_change'].includes(this.action)) {
        this.riskLevel = 'medium';
    }
    
    next();
});

// Static method to create audit log entry
auditLogSchema.statics.log = async function(data) {
    try {
        const auditLog = new this(data);
        await auditLog.save();
        return auditLog;
    } catch (error) {
        console.error('Error creating audit log:', error);
        return null;
    }
};

// Static method to get audit logs with filtering
auditLogSchema.statics.getAuditLogs = async function(filters = {}, page = 1, limit = 50) {
    const query = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.status) query.status = filters.status;
    if (filters.riskLevel) query.riskLevel = filters.riskLevel;
    if (filters.userRole) query.userRole = filters.userRole;
    if (filters.isAnonymous !== undefined) query.isAnonymous = filters.isAnonymous;
    if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
    if (filters.endDate) {
        if (query.createdAt) {
            query.createdAt.$lte = new Date(filters.endDate);
        } else {
            query.createdAt = { $lte: new Date(filters.endDate) };
        }
    }
    
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'firstName lastName email')
            .lean(),
        this.countDocuments(query)
    ]);
    
    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// Static method to get suspicious activities
auditLogSchema.statics.getSuspiciousActivities = async function(days = 7) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const query = {
            createdAt: { $gte: cutoffDate },
            $or: [
                { isSuspicious: true },
                { riskLevel: { $in: ['high', 'critical'] } },
                { status: 'failure' },
                { action: { $in: ['login_failed', 'permission_violation', 'suspicious_activity_detected'] } }
            ]
        };
        
        const suspiciousActivities = await this.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'firstName lastName email')
            .lean();
            
        return suspiciousActivities;
    } catch (error) {
        console.error('Error getting suspicious activities:', error);
        throw error;
    }
};

// Static method to get user activity summary
auditLogSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const query = {
            userId: userId,
            createdAt: { $gte: cutoffDate }
        };
        
        const activities = await this.find(query)
            .sort({ createdAt: -1 })
            .select('action resourceType status riskLevel createdAt')
            .lean();
            
        return activities;
    } catch (error) {
        console.error('Error getting user activity summary:', error);
        throw error;
    }
};

// Migration method to add isAnonymous field to existing documents
auditLogSchema.statics.migrateIsAnonymous = async function() {
    try {
        const result = await this.updateMany(
            { isAnonymous: { $exists: false } },
            [
                {
                    $set: {
                        isAnonymous: {
                            $cond: {
                                if: { $eq: ['$userId', null] },
                                then: true,
                                else: false
                            }
                        }
                    }
                }
            ]
        );
        
        console.log(`Migration completed: ${result.modifiedCount} documents updated`);
        return result;
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
