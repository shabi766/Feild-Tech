import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        // Find the user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        // ✅ Update last seen timestamp
        user.lastSeen = new Date();
        await user.save();

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAuthenticated;
