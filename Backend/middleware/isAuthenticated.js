import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            console.error("JWT Verification Error:", jwtError);
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAuthenticated;