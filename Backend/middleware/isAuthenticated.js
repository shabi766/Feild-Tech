import jwt from "jsonwebtoken";
// Legacy middleware - services should use shared-middleware/index.js instead
// User model removed to avoid cross-service dependencies

const isAuthenticated = async (req, res, next) => {
    try {
        // Check for token in cookies first, then in Authorization header
        let token = req.cookies.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY || "fallback_secret_key_for_dev_only");
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid or expired token", success: false });
        }

        // Just use decoded token data without fetching user from database
        // Services should fetch user data from auth-service if needed
        req.user = {
            userId: decoded.userId,
            _id: decoded.userId, // For backward compatibility
            companyId: decoded.companyId,
            role: decoded.role,
            recruiterType: decoded.recruiterType
        };

        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAuthenticated;