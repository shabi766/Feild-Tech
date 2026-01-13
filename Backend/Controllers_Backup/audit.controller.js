import AuditService from '../utils/auditService.js';
import isAdmin from '../middleware/isAdmin.js';

class AuditController {
    /**
     * Get all audit logs with filtering and pagination
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAuditLogs(req, res) {
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

            const auditLogs = await AuditService.getAuditLogs(
                filters,
                parseInt(page),
                parseInt(limit)
            );

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
    }

    /**
     * Get suspicious activities
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getSuspiciousActivities(req, res) {
        try {
            const { days = 7 } = req.query;
            
            const suspiciousActivities = await AuditService.getSuspiciousActivities(
                parseInt(days)
            );

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
    }

    /**
     * Get user activity summary
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUserActivitySummary(req, res) {
        try {
            const { userId } = req.params;
            const { days = 30 } = req.query;
            
            const activitySummary = await AuditService.getUserActivitySummary(
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
    }

    /**
     * Get audit log statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAuditStats(req, res) {
        try {
            const { days = 30 } = req.query;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            // Get counts by action type
            const actionStats = await AuditService.getAuditLogs({
                startDate: startDate.toISOString()
            }, 1, 1000);

            const stats = {
                totalLogs: actionStats.total,
                byAction: {},
                byRiskLevel: {},
                byStatus: {},
                byUserRole: {},
                suspiciousActivities: 0,
                highRiskActivities: 0,
                criticalRiskActivities: 0
            };

            // Process logs to build statistics
            actionStats.logs.forEach(log => {
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
    }

    /**
     * Export audit logs to CSV
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async exportAuditLogs(req, res) {
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
            const auditLogs = await AuditService.getAuditLogs(filters, 1, 10000);

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
    }

    /**
     * Clean old audit logs
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async cleanOldLogs(req, res) {
        try {
            const result = await AuditService.cleanOldLogs();
            
            res.status(200).json({
                success: true,
                message: 'Old audit logs cleaned successfully',
                data: result
            });
        } catch (error) {
            console.error('Error cleaning old logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clean old audit logs',
                error: error.message
            });
        }
    }
}

export default AuditController;
