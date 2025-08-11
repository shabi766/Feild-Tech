import AuditLog from '../Models/auditLog.model.js';

class AuditService {
    /**
     * Create an audit log entry
     * @param {Object} data - Audit log data
     * @returns {Promise<Object|null>} Created audit log or null
     */
    static async log(data) {
        try {
            // Ensure required fields are present (userId is optional for anonymous users)
            if (!data.action || !data.resourceType) {
                console.error('Missing required fields for audit log:', data);
                return null;
            }

            // Set isAnonymous if not provided
            if (data.isAnonymous === undefined) {
                data.isAnonymous = !data.userId;
            }

            // Ensure userEmail and userRole are present
            if (!data.userEmail) {
                data.userEmail = data.isAnonymous ? 'anonymous@alphaplatform.com' : 'unknown@email.com';
            }
            
            if (!data.userRole) {
                data.userRole = data.isAnonymous ? 'anonymous' : 'unknown';
            }

            // Ensure userIp and userAgent are present
            if (!data.userIp) {
                data.userIp = '127.0.0.1';
            }
            
            if (!data.userAgent) {
                data.userAgent = 'Unknown';
            }

            // Add timestamp if not provided
            if (!data.timestamp) {
                data.timestamp = new Date();
            }

            // Create and save the audit log
            const auditLog = await AuditLog.log(data);
            return auditLog;
        } catch (error) {
            console.error('Error in audit service log:', error);
            return null;
        }
    }

    /**
     * Log user authentication events
     * @param {Object} user - User object
     * @param {String} action - Authentication action
     * @param {Object} req - Express request object
     * @param {String} status - Action status
     * @param {String} details - Additional details
     */
    static async logAuthEvent(user, action, req, status = 'success', details = null) {
        const auditData = {
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
            userIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            action: action,
            resourceType: 'user',
            resourceId: user._id,
            resourceName: `${user.firstName} ${user.lastName}`,
            status: status,
            details: details,
            endpoint: req.originalUrl,
            httpMethod: req.method,
            sessionId: req.session?.id,
            requestId: req.headers['x-request-id'] || req.id
        };

        await this.log(auditData);
    }

    /**
     * Log CRUD operations
     * @param {Object} user - User performing the action
     * @param {String} action - CRUD action
     * @param {String} resourceType - Type of resource
     * @param {Object} resource - Resource object
     * @param {Object} req - Express request object
     * @param {Object} previousValues - Previous values (for updates)
     * @param {Object} newValues - New values (for updates)
     */
    static async logCRUDEvent(user, action, resourceType, resource, req, previousValues = null, newValues = null) {
        const auditData = {
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
            userIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            action: action,
            resourceType: resourceType,
            resourceId: resource._id,
            resourceName: resource.name || resource.title || resource.email || resource._id.toString(),
            status: 'success',
            details: {
                operation: action,
                resourceType: resourceType,
                resourceId: resource._id
            },
            previousValues: previousValues,
            newValues: newValues,
            endpoint: req.originalUrl,
            httpMethod: req.method,
            sessionId: req.session?.id,
            requestId: req.headers['x-request-id'] || req.id
        };

        await this.log(auditData);
    }

    /**
     * Log financial transactions
     * @param {Object} user - User performing the action
     * @param {String} action - Financial action
     * @param {Object} transaction - Transaction object
     * @param {Object} req - Express request object
     * @param {String} status - Transaction status
     * @param {String} details - Additional details
     */
    static async logFinancialEvent(user, action, transaction, req, status = 'success', details = null) {
        const auditData = {
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
            userIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            action: action,
            resourceType: 'transaction',
            resourceId: transaction._id,
            resourceName: `Transaction ${transaction._id}`,
            status: status,
            details: {
                ...details,
                amount: transaction.amount,
                currency: transaction.currency,
                transactionType: transaction.type
            },
            endpoint: req.originalUrl,
            httpMethod: req.method,
            sessionId: req.session?.id,
            requestId: req.headers['x-request-id'] || req.id,
            isComplianceRequired: true,
            complianceTags: ['gdpr', 'custom']
        };

        await this.log(auditData);
    }

    /**
     * Log system events
     * @param {String} action - System action
     * @param {String} resourceType - Type of resource
     * @param {Object} details - Action details
     * @param {String} status - Action status
     */
    static async logSystemEvent(action, resourceType, details = null, status = 'success') {
        const auditData = {
            userId: null, // System events don't have a user
            userEmail: 'system@alphaplatform.com',
            userRole: 'system',
            userIp: '127.0.0.1',
            userAgent: 'System',
            isAnonymous: false, // System events are not anonymous user events
            action: action,
            resourceType: resourceType,
            status: status,
            details: details,
            isComplianceRequired: false
        };

        await this.log(auditData);
    }

    /**
     * Log suspicious activities
     * @param {Object} user - User involved
     * @param {String} action - Suspicious action
     * @param {Object} req - Express request object
     * @param {Array} flags - Suspicious activity flags
     * @param {String} details - Additional details
     */
    static async logSuspiciousActivity(user, action, req, flags = [], details = null) {
        const auditData = {
            userId: user?._id,
            userEmail: user?.email || 'unknown@email.com',
            userRole: user?.role || 'unknown',
            userIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            isAnonymous: !user?._id, // Set to true if no user ID
            action: action,
            resourceType: 'security',
            status: 'failure',
            details: details,
            endpoint: req.originalUrl,
            httpMethod: req.method,
            sessionId: req.session?.id,
            requestId: req.headers['x-request-id'] || req.id,
            riskLevel: 'high',
            isSuspicious: true,
            flags: flags
        };

        await this.log(auditData);
    }

    /**
     * Get audit logs with filtering
     * @param {Object} filters - Filter criteria
     * @param {Number} page - Page number
     * @param {Number} limit - Items per page
     * @returns {Promise<Object>} Paginated audit logs
     */
    static async getAuditLogs(filters = {}, page = 1, limit = 50) {
        try {
            return await AuditLog.getAuditLogs(filters, page, limit);
        } catch (error) {
            console.error('Error getting audit logs:', error);
            throw error;
        }
    }

    /**
     * Get suspicious activities
     * @param {Number} days - Number of days to look back
     * @returns {Promise<Array>} Suspicious activities
     */
    static async getSuspiciousActivities(days = 7) {
        try {
            return await AuditLog.getSuspiciousActivities(days);
        } catch (error) {
            console.error('Error getting suspicious activities:', error);
            throw error;
        }
    }

    /**
     * Get user activity summary
     * @param {String} userId - User ID
     * @param {Number} days - Number of days to look back
     * @returns {Promise<Array>} User activity summary
     */
    static async getUserActivitySummary(userId, days = 30) {
        try {
            return await AuditLog.getUserActivitySummary(userId, days);
        } catch (error) {
            console.error('Error getting user activity summary:', error);
            throw error;
        }
    }

    /**
     * Clean old audit logs
     * @returns {Promise<Object>} Cleanup result
     */
    static async cleanOldLogs() {
        try {
            return await AuditLog.cleanOldLogs();
        } catch (error) {
            console.error('Error cleaning old logs:', error);
        }
    }

    /**
     * Migrate existing audit logs to include isAnonymous field
     * @returns {Promise<Object>} Migration result
     */
    static async migrateIsAnonymous() {
        try {
            return await AuditLog.migrateIsAnonymous();
        } catch (error) {
            console.error('Error migrating audit logs:', error);
            throw error;
        }
    }
}

export default AuditService;
