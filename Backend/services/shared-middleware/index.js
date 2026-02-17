import jwt from "jsonwebtoken";

export const createAuthMiddleware = (options = {}) => {
    // Don't capture process.env.SECRET_KEY here because it might not be loaded yet due to ESM import hoisting
    const explicitSecret = options.secretKey;
    const getUserById = options.getUserById; // Optional: for services that have User model

    return async (req, res, next) => {
        try {
            // Resolve secret key at runtime to ensure dotenv has loaded
            const secretKey = explicitSecret || process.env.SECRET_KEY || "fallback_secret_key_for_dev_only";

            if (!process.env.SECRET_KEY && !explicitSecret) {
                // Only warn once or in dev if needed, typically we just fallback
                // console.warn('Warning: SECRET_KEY not found in env, using fallback.');
            }

            // Check for token in cookies first, then in Authorization header
            let token = req.cookies?.token;

            if (!token) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                return res.status(401).json({
                    message: "User not authenticated",
                    success: false
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, secretKey);
            } catch (jwtError) {
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
