import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

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
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid or expired token", success: false });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        // Atomic update to avoid VersionError on save()
        await User.updateOne({ _id: user._id }, { $set: { lastSeen: new Date() } });

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAuthenticated;