import winston from 'winston';

/**
 * Structured logging utility for microservices
 * Replaces console.log with proper logging levels and formatting
 */

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, service, ...metadata }) => {
    let msg = `${timestamp} [${service || 'unknown'}] ${level}: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
});

/**
 * Create a logger instance for a service
 * @param {string} serviceName - Name of the microservice
 * @param {string} logLevel - Logging level (default: 'info')
 * @returns {winston.Logger} Logger instance
 */
export const createLogger = (serviceName, logLevel = 'info') => {
    return winston.createLogger({
        level: logLevel,
        defaultMeta: { service: serviceName },
        format: combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        ),
        transports: [
            // Console transport for development
            new winston.transports.Console({
                format: combine(
                    colorize(),
                    logFormat
                ),
            }),
            // File transport for errors
            new winston.transports.File({
                filename: `logs/${serviceName}-error.log`,
                level: 'error',
            }),
            // File transport for all logs
            new winston.transports.File({
                filename: `logs/${serviceName}-combined.log`,
            }),
        ],
    });
};

/**
 * Express middleware to log HTTP requests
 * @param {winston.Logger} logger - Logger instance
 * @returns {Function} Express middleware
 */
export const requestLogger = (logger) => {
    return (req, res, next) => {
        const start = Date.now();

        // Log when response finishes
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info('HTTP Request', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                userAgent: req.get('user-agent'),
            });
        });

        next();
    };
};

export default {
    createLogger,
    requestLogger,
};
