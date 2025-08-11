import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid or expired token", success: false });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        // Check if user has admin role
        if (user.role !== 'Admin') {
            return res.status(403).json({ 
                message: "Access denied. Admin privileges required.", 
                success: false 
            });
        }

        // Atomic update to avoid VersionError on save()
        await User.updateOne({ _id: user._id }, { $set: { lastSeen: new Date() } });

        req.user = user;
        next();
    } catch (error) {
        console.error("Admin Authentication Error:", error);
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAdmin;
