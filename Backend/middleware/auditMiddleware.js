import AuditService from '../utils/auditService.js';

/**
 * Middleware to automatically log all API requests and responses
 * This middleware should be placed after authentication middleware
 */
export const auditMiddleware = async (req, res, next) => {
    // Store original send method
    const originalSend = res.send;
    const startTime = Date.now();
    
    // Override send method to capture response
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Log the request/response
        logRequestResponse(req, res, data, responseTime);
        
        // Call original send method
        return originalSend.call(this, data);
    };
    
    next();
};

/**
 * Log request and response details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {any} responseData - Response data
 * @param {Number} responseTime - Response time in milliseconds
 */
async function logRequestResponse(req, res, responseData, responseTime) {
    try {
        // Skip logging for certain endpoints
        if (shouldSkipLogging(req.path)) {
            return;
        }

        // Get user information from request
        const user = req.user;
        if (!user) {
            // Log as anonymous user for unauthenticated requests
            const action = formatActionName(req.method, req.path);
            
            await AuditService.log({
                userId: null,
                userEmail: 'anonymous@alphaplatform.com',
                userRole: 'anonymous',
                userIp: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent') || 'Unknown',
                isAnonymous: true,
                action: action,
                resourceType: 'api_endpoint',
                resourceId: null,
                resourceName: req.path,
                status: res.statusCode < 400 ? 'success' : 'failure',
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: sanitizeRequestBody(req.body),
                    responseTime: responseTime,
                    statusCode: res.statusCode
                },
                endpoint: req.originalUrl,
                httpMethod: req.method,
                responseTime: responseTime,
                riskLevel: determineRiskLevel(req, res.statusCode)
            });
            return;
        }

        // Log authenticated user requests
        const action = formatActionName(req.method, req.path);
        
        await AuditService.log({
            userId: user._id,
            userEmail: user.email,
            userRole: user.role,
            userIp: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'Unknown',
            isAnonymous: false,
            action: action,
            resourceType: 'api_endpoint',
            resourceId: null,
            resourceName: req.path,
            status: res.statusCode < 400 ? 'success' : 'failure',
            details: {
                method: req.method,
                path: req.path,
                query: req.query,
                body: sanitizeRequestBody(req.body),
                responseTime: responseTime,
                statusCode: res.statusCode,
                userId: user._id,
                userRole: user.role
            },
            endpoint: req.originalUrl,
            httpMethod: req.method,
            sessionId: req.session?.id,
            requestId: req.headers['x-request-id'] || req.id,
            responseTime: responseTime,
            riskLevel: determineRiskLevel(req, res.statusCode)
        });

    } catch (error) {
        // Don't let audit logging errors break the application
        console.error('Error in audit middleware:', error);
    }
}

/**
 * Determine if the request should be skipped for logging
 * @param {String} path - Request path
 * @returns {Boolean} True if logging should be skipped
 */
function shouldSkipLogging(path) {
    const skipPaths = [
        '/api/v1/audit/logs', // Avoid infinite loops
        '/api/v1/audit/stats',
        '/api/v1/audit/export',
        '/health',
        '/favicon.ico'
    ];
    
    return skipPaths.some(skipPath => path.includes(skipPath));
}

/**
 * Format action name for better readability
 * @param {String} method - HTTP method
 * @param {String} path - Request path
 * @returns {String} Formatted action name
 */
function formatActionName(method, path) {
    // Remove leading slash and convert to lowercase
    let cleanPath = path.replace(/^\/+/, '').toLowerCase();
    
    // Replace slashes with underscores
    cleanPath = cleanPath.replace(/\//g, '_');
    
    // Remove trailing underscores
    cleanPath = cleanPath.replace(/_+$/, '');
    
    // Handle empty path
    if (!cleanPath) {
        cleanPath = 'root';
    }
    
    // Create action name: method_path
    return `${method.toLowerCase()}_${cleanPath}`;
}

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeRequestBody(body) {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });
    
    return sanitized;
}

/**
 * Determine risk level based on request and response
 * @param {Object} req - Express request object
 * @param {Number} statusCode - Response status code
 * @returns {String} Risk level
 */
function determineRiskLevel(req, statusCode) {
    // High-risk operations
    if (['DELETE', 'PUT', 'PATCH'].includes(req.method)) {
        return 'high';
    }
    
    // Authentication endpoints
    if (req.path.includes('/login') || req.path.includes('/register')) {
        return 'medium';
    }
    
    // Error responses
    if (statusCode >= 400) {
        return 'medium';
    }
    
    // Admin endpoints
    if (req.path.includes('/admin') || req.path.includes('/administration')) {
        return 'high';
    }
    
    return 'low';
}

/**
 * Middleware to log specific events (for manual logging)
 * @param {String} action - Action to log
 * @param {String} resourceType - Type of resource
 * @param {Object} resource - Resource object
 * @param {Object} previousValues - Previous values (for updates)
 * @param {Object} newValues - New values (for updates)
 */
export const logEvent = (action, resourceType, resource = null, previousValues = null, newValues = null) => {
    return async (req, res, next) => {
        try {
            if (req.user && resource) {
                await AuditService.logCRUDEvent(
                    req.user,
                    action,
                    resourceType,
                    resource,
                    req,
                    previousValues,
                    newValues
                );
            }
        } catch (error) {
            console.error('Error logging event:', error);
        }
        next();
    };
};

/**
 * Middleware to log authentication events
 * @param {String} action - Authentication action
 * @param {String} status - Action status
 * @param {String} details - Additional details
 */
export const logAuthEvent = (action, status = 'success', details = null) => {
    return async (req, res, next) => {
        try {
            if (req.user) {
                await AuditService.logAuthEvent(req.user, action, req, status, details);
            }
        } catch (error) {
            console.error('Error logging auth event:', error);
        }
        next();
    };
};

export default auditMiddleware;
