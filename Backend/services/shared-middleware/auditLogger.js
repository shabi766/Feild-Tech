/**
 * Centralized Audit Logger
 * Sends audit logs to admin-service for centralized tracking
 */

/**
 * Audit log levels
 */
export const AuditLevel = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical',
};

/**
 * Audit event types
 */
export const AuditEventType = {
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
    USER_REGISTER: 'user.register',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    JOB_CREATE: 'job.create',
    JOB_UPDATE: 'job.update',
    JOB_DELETE: 'job.delete',
    JOB_ASSIGN: 'job.assign',
    PAYMENT_CREATE: 'payment.create',
    PAYMENT_COMPLETE: 'payment.complete',
    COMPANY_CREATE: 'company.create',
    COMPANY_UPDATE: 'company.update',
    ROLE_CREATE: 'role.create',
    ROLE_UPDATE: 'role.update',
    PERMISSION_CHANGE: 'permission.change',
};

/**
 * AuditLogger class
 * Handles audit logging across microservices
 */
export class AuditLogger {
    constructor(serviceName, adminServiceUrl = null) {
        this.serviceName = serviceName;
        this.adminServiceUrl = adminServiceUrl || process.env.ADMIN_SERVICE_URL || 'http://localhost:8008';
        this.logs = []; // In-memory buffer for failed sends
    }

    /**
     * Log an audit event
     * @param {Object} event - Audit event details
     * @param {string} event.eventType - Type of event (use AuditEventType)
     * @param {string} event.userId - ID of user performing action
     * @param {string} event.level - Severity level (use AuditLevel)
     * @param {string} event.description - Human-readable description
     * @param {Object} event.metadata - Additional metadata
     * @param {string} event.ipAddress - IP address of request
     * @param {string} event.userAgent - User agent string
     */
    async log(event) {
        const auditLog = {
            service: this.serviceName,
            eventType: event.eventType,
            userId: event.userId,
            level: event.level || AuditLevel.INFO,
            description: event.description,
            metadata: event.metadata || {},
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            timestamp: new Date(),
        };

        // Try to send to admin service
        try {
            const response = await fetch(`${this.adminServiceUrl}/api/v1/audit/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(auditLog),
            });

            if (!response.ok) {
                throw new Error(`Failed to send audit log: ${response.statusText}`);
            }

            // If successful and we have buffered logs, try to send them
            if (this.logs.length > 0) {
                await this.flushBuffer();
            }
        } catch (error) {
            console.error('Failed to send audit log to admin service:', error.message);
            // Buffer the log for later retry
            this.logs.push(auditLog);

            // Prevent buffer from growing too large
            if (this.logs.length > 1000) {
                this.logs.shift(); // Remove oldest log
            }
        }
    }

    /**
     * Flush buffered logs
     */
    async flushBuffer() {
        const logsToSend = [...this.logs];
        this.logs = [];

        for (const log of logsToSend) {
            try {
                await fetch(`${this.adminServiceUrl}/api/v1/audit/log`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(log),
                });
            } catch (error) {
                // Re-buffer failed logs
                this.logs.push(log);
            }
        }
    }

    /**
     * Create audit middleware for Express
     * Automatically logs HTTP requests
     */
    createMiddleware(options = {}) {
        const {
            excludePaths = ['/health', '/metrics'],
            logLevel = AuditLevel.INFO,
        } = options;

        return async (req, res, next) => {
            // Skip excluded paths
            if (excludePaths.some(path => req.path.startsWith(path))) {
                return next();
            }

            // Log after response
            res.on('finish', () => {
                // Only log significant events (not GET requests, unless they fail)
                if (req.method === 'GET' && res.statusCode < 400) {
                    return;
                }

                this.log({
                    eventType: `${req.method.toLowerCase()}.${req.path.replace(/\//g, '.')}`,
                    userId: req.user?.userId || req.user?._id || 'anonymous',
                    level: res.statusCode >= 400 ? AuditLevel.ERROR : logLevel,
                    description: `${req.method} ${req.path} - ${res.statusCode}`,
                    metadata: {
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode,
                        body: req.method !== 'GET' ? req.body : undefined,
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                }).catch(err => {
                    console.error('Audit logging failed:', err);
                });
            });

            next();
        };
    }
}

/**
 * Create an audit logger instance
 * @param {string} serviceName - Name of the service
 * @param {string} adminServiceUrl - URL of admin service (optional)
 * @returns {AuditLogger} Audit logger instance
 */
export const createAuditLogger = (serviceName, adminServiceUrl = null) => {
    return new AuditLogger(serviceName, adminServiceUrl);
};

export default {
    AuditLogger,
    AuditLevel,
    AuditEventType,
    createAuditLogger,
};
