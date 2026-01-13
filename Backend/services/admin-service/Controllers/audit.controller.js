import AuditLog from '../Models/auditLog.model.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';

/**
 * Get all audit logs with filtering and pagination
 */
export const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            userId,
            action,
            resourceType,
            status,
            riskLevel,
            userRole,
            startDate,
            endDate
        } = req.query;

        const filters = {
            userId,
            action,
            resourceType,
            status,
            riskLevel,
            userRole,
            startDate,
            endDate
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const auditLogs = await AuditLog.getAuditLogs(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        // Enrich logs with user data from Auth Service if userIds exist
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (token && auditLogs.logs.length > 0) {
            const userIds = [...new Set(auditLogs.logs
                .map(log => log.userId)
                .filter(id => id)
            )];
            
            if (userIds.length > 0) {
                try {
                    const users = await AuthServiceClient.getUsers(userIds, token);
                    auditLogs.logs = auditLogs.logs.map(log => {
                        if (log.userId) {
                            const user = users.find(u => 
                                (u._id || u.id)?.toString() === log.userId?.toString()
                            );
                            if (user) {
                                log.user = {
                                    _id: user._id || user.id,
                                    fullname: user.fullname,
                                    email: user.email
                                };
                            }
                        }
                        return log;
                    });
                } catch (error) {
                    console.error('Error enriching audit logs with user data:', error);
                    // Continue without user enrichment
                }
            }
        }

        res.status(200).json({
            success: true,
            data: auditLogs
        });
    } catch (error) {
        console.error('Error getting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit logs',
            error: error.message
        });
    }
};

/**
 * Get suspicious activities
 */
export const getSuspiciousActivities = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        const suspiciousActivities = await AuditLog.getSuspiciousActivities(
            parseInt(days)
        );

        // Enrich with user data
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        if (token && suspiciousActivities.length > 0) {
            const userIds = [...new Set(suspiciousActivities
                .map(activity => activity.userId)
                .filter(id => id)
            )];
            
            if (userIds.length > 0) {
                try {
                    const users = await AuthServiceClient.getUsers(userIds, token);
                    suspiciousActivities.forEach(activity => {
                        if (activity.userId) {
                            const user = users.find(u => 
                                (u._id || u.id)?.toString() === activity.userId?.toString()
                            );
                            if (user) {
                                activity.user = {
                                    _id: user._id || user.id,
                                    fullname: user.fullname,
                                    email: user.email
                                };
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error enriching suspicious activities with user data:', error);
                }
            }
        }

        res.status(200).json({
            success: true,
            data: suspiciousActivities
        });
    } catch (error) {
        console.error('Error getting suspicious activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve suspicious activities',
            error: error.message
        });
    }
};

/**
 * Get user activity summary
 */
export const getUserActivitySummary = async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        const activitySummary = await AuditLog.getUserActivitySummary(
            userId,
            parseInt(days)
        );

        res.status(200).json({
            success: true,
            data: activitySummary
        });
    } catch (error) {
        console.error('Error getting user activity summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user activity summary',
            error: error.message
        });
    }
};

/**
 * Get audit log statistics
 */
export const getAuditStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get logs for the time period
        const auditLogs = await AuditLog.getAuditLogs({
            startDate: startDate.toISOString()
        }, 1, 10000);

        const stats = {
            totalLogs: auditLogs.total,
            byAction: {},
            byRiskLevel: {},
            byStatus: {},
            byUserRole: {},
            suspiciousActivities: 0,
            highRiskActivities: 0,
            criticalRiskActivities: 0
        };

        // Process logs to build statistics
        auditLogs.logs.forEach(log => {
            // Count by action
            stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
            
            // Count by risk level
            stats.byRiskLevel[log.riskLevel] = (stats.byRiskLevel[log.riskLevel] || 0) + 1;
            
            // Count by status
            stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
            
            // Count by user role
            stats.byUserRole[log.userRole] = (stats.byUserRole[log.userRole] || 0) + 1;
            
            // Count suspicious and high-risk activities
            if (log.isSuspicious) stats.suspiciousActivities++;
            if (log.riskLevel === 'high') stats.highRiskActivities++;
            if (log.riskLevel === 'critical') stats.criticalRiskActivities++;
        });

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting audit stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit statistics',
            error: error.message
        });
    }
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogs = async (req, res) => {
    try {
        const {
            userId,
            action,
            resourceType,
            status,
            riskLevel,
            userRole,
            startDate,
            endDate
        } = req.query;

        const filters = {
            userId,
            action,
            resourceType,
            status,
            riskLevel,
            userRole,
            startDate,
            endDate
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        // Get all logs for export (no pagination)
        const auditLogs = await AuditLog.getAuditLogs(filters, 1, 10000);

        // Convert to CSV format
        const csvHeaders = [
            'Timestamp',
            'User ID',
            'User Email',
            'User Role',
            'User IP',
            'Action',
            'Resource Type',
            'Resource ID',
            'Status',
            'Risk Level',
            'Details'
        ];

        const csvRows = auditLogs.logs.map(log => [
            new Date(log.createdAt).toISOString(),
            log.userId?._id || log.userId || '',
            log.userEmail || '',
            log.userRole || '',
            log.userIp || '',
            log.action || '',
            log.resourceType || '',
            log.resourceId || '',
            log.status || '',
            log.riskLevel || '',
            JSON.stringify(log.details || {})
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
        
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export audit logs',
            error: error.message
        });
    }
};

/**
 * Clean old audit logs
 */
export const cleanOldLogs = async (req, res) => {
    try {
        const { days = 2555 } = req.query; // Default retention period
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        
        // Find logs older than cutoff date that are not compliance required
        const result = await AuditLog.deleteMany({
            createdAt: { $lt: cutoffDate },
            isComplianceRequired: false
        });
        
        res.status(200).json({
            success: true,
            message: 'Old audit logs cleaned successfully',
            data: {
                deletedCount: result.deletedCount,
                cutoffDate: cutoffDate.toISOString()
            }
        });
    } catch (error) {
        console.error('Error cleaning old logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clean old audit logs',
            error: error.message
        });
    }
};
