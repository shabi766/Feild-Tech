/**
 * Admin Middleware
 * Verifies that the authenticated user has admin role
 */

const isAdmin = (req, res, next) => {
    try {
        // Check if user is authenticated (should be set by isAuthenticated middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please authenticate first."
            });
        }

        // Check if user has admin role
        const userRole = req.user.role || req.user.userRole;
        
        if (userRole !== 'Admin' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Forbidden. Admin access required."
            });
        }

        // User is admin, proceed
        next();
    } catch (error) {
        console.error("Error in admin middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying admin access",
            error: error.message
        });
    }
};

export default isAdmin;
