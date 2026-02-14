/**
 * Health check utility for microservices
 * Provides standardized health check endpoints
 */

/**
 * Create a health check endpoint
 * @param {Object} dependencies - Dependencies to check (e.g., database, external services)
 * @returns {Function} Express route handler
 */
export const createHealthCheck = (dependencies = {}) => {
    return async (req, res) => {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: dependencies.serviceName || 'unknown',
            uptime: process.uptime(),
            checks: {},
        };

        let allHealthy = true;

        // Check database connection
        if (dependencies.database) {
            try {
                await dependencies.database.db.admin().ping();
                health.checks.database = { status: 'healthy' };
            } catch (error) {
                health.checks.database = { status: 'unhealthy', error: error.message };
                allHealthy = false;
            }
        }

        // Check external services
        if (dependencies.externalServices) {
            for (const [name, checkFn] of Object.entries(dependencies.externalServices)) {
                try {
                    await checkFn();
                    health.checks[name] = { status: 'healthy' };
                } catch (error) {
                    health.checks[name] = { status: 'unhealthy', error: error.message };
                    allHealthy = false;
                }
            }
        }

        health.status = allHealthy ? 'healthy' : 'degraded';
        const statusCode = allHealthy ? 200 : 503;

        res.status(statusCode).json(health);
    };
};

export default {
    createHealthCheck,
};
