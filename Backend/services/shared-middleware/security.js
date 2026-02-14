import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Security middleware configuration for microservices
 */

/**
 * Helmet configuration for security headers
 * Protects against common vulnerabilities
 */
export const createHelmetMiddleware = () => {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: {
            action: 'deny',
        },
        noSniff: true,
        xssFilter: true,
    });
};

/**
 * Rate limiting configuration
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Max requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 * @returns {Function} Express rate limit middleware
 */
export const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // limit each IP to 100 requests per windowMs
        message = 'Too many requests from this IP, please try again later.',
        standardHeaders = true,
        legacyHeaders = false,
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: { success: false, message },
        standardHeaders,
        legacyHeaders,
    });
};

/**
 * Strict rate limiter for sensitive endpoints (login, register, password reset)
 */
export const strictRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many attempts from this IP, please try again after 15 minutes.',
});

/**
 * Moderate rate limiter for API endpoints
 */
export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please slow down.',
});

/**
 * Lenient rate limiter for public endpoints
 */
export const publicRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per 15 minutes
    message: 'Rate limit exceeded, please try again later.',
});

export default {
    createHelmetMiddleware,
    createRateLimiter,
    strictRateLimiter,
    apiRateLimiter,
    publicRateLimiter,
};
