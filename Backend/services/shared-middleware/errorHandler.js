/**
 * Global error handler middleware for microservices
 * Standardizes error responses across all services
 */

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 * @param {winston.Logger} logger - Logger instance (optional)
 * @returns {Function} Express error handling middleware
 */
export const createErrorHandler = (logger = null) => {
    return (err, req, res, next) => {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';

        // Log error
        if (logger) {
            logger.error('Error occurred', {
                message: err.message,
                statusCode: err.statusCode,
                stack: err.stack,
                url: req.originalUrl,
                method: req.method,
            });
        } else {
            console.error('Error:', err);
        }

        // Development error response (detailed)
        if (process.env.NODE_ENV === 'development') {
            return res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message,
                error: err,
                stack: err.stack,
            });
        }

        // Production error response (sanitized)
        // Only send operational errors to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message,
            });
        }

        // Programming or unknown errors: don't leak details
        return res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong',
        });
    };
};

/**
 * Async error wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

export default {
    AppError,
    createErrorHandler,
    catchAsync,
};
