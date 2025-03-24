import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";
import axios from 'axios';

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            // Token expired, attempt refresh
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post('/refresh-token', {}, {
                        headers: { Cookie: `refreshToken=${refreshToken}` }, withCredentials: true
                    });
                    token = refreshResponse.data.accessToken;
                    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' }); // Update cookie
                    decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify new token
                } catch (refreshError) {
                    return res.status(401).json({ message: "Refresh token invalid", success: false });
                }
            } else {
                return res.status(401).json({ message: "Invalid token", success: false });
            }
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: "User not found", success: false });
        }

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