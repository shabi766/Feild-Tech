import jwt from "jsonwebtoken";

export const createAuthMiddleware = (options = {}) => {
    const secretKey = options.secretKey || process.env.SECRET_KEY || "fallback_secret_key_for_dev_only";

    if (!secretKey) {
        throw new Error('SECRET_KEY is required for authentication middleware. Please set it in your environment variables.');
    }

    const getUserById = options.getUserById; // Optional: for services that have User model

    return async (req, res, next) => {
        try {
            // Check for token in cookies first, then in Authorization header
            let token = req.cookies?.token;

            if (!token) {
                console.log(`[AuthMiddleware] No token in cookies. Cookies keys: ${Object.keys(req.cookies || {}).join(', ')}`);
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                    console.log("[AuthMiddleware] Token found in Authorization header");
                }
            } else {
                // console.log("[AuthMiddleware] Token found in cookies");
            }

            if (!token) {
                console.log("[AuthMiddleware] User not authenticated - No token found");
                return res.status(401).json({
                    message: "User not authenticated",
                    success: false
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, secretKey);
            } catch (jwtError) {
                console.log(`[AuthMiddleware] Token verification failed: ${jwtError.message}`);
                return res.status(401).json({
                    message: "Invalid or expired token",
                    success: false
                });
            }

            // If getUserById is provided, fetch full user data
            // Otherwise, just use the decoded token data
            if (getUserById) {
                const user = await getUserById(decoded.userId);
                if (!user) {
                    console.log("[AuthMiddleware] User not found in DB");
                    return res.status(401).json({
                        message: "User not found",
                        success: false
                    });
                }

                // Update lastSeen if user object has save method (Mongoose model)
                if (user.updateOne) {
                    await user.updateOne({ $set: { lastSeen: new Date() } });
                }

                // Add JWT payload data to user object
                req.user = {
                    ...user.toObject ? user.toObject() : user,
                    companyId: decoded.companyId,
                    role: decoded.role,
                    recruiterType: decoded.recruiterType
                };
            } else {
                // Just use decoded token data
                req.user = {
                    userId: decoded.userId,
                    companyId: decoded.companyId,
                    role: decoded.role,
                    recruiterType: decoded.recruiterType
                };
            }

            next();
        } catch (error) {
            console.error("Authentication Error:", error);
            return res.status(401).json({
                message: "Authentication failed",
                success: false,
                error: error.message
            });
        }
    };
};

/**
 * Default export - returns the factory function
 * Usage: const isAuthenticated = createAuthMiddleware();
 */
export default createAuthMiddleware;

// Export all shared utilities
export * from './security.js';
export * from './logger.js';
export * from './errorHandler.js';
export * from './validation.js';
export * from './auditLogger.js';
export * from './healthCheck.js';
