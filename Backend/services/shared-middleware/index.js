import jwt from "jsonwebtoken";

/**
 * Shared authentication middleware for microservices
 * Verifies JWT tokens and attaches user info to request
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.secretKey - JWT secret key (defaults to process.env.SECRET_KEY)
 * @param {Function} options.getUserById - Optional function to fetch user from database
 * @returns {Function} Express middleware function
 */
export const createAuthMiddleware = (options = {}) => {
    const secretKey = options.secretKey || process.env.SECRET_KEY;
    const getUserById = options.getUserById; // Optional: for services that have User model

    return async (req, res, next) => {
        try {
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
