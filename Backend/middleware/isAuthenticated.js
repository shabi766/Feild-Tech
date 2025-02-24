import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        console.log("isAuthenticated middleware called");  // Confirm execution

        console.log("req.cookies:", req.cookies); // Log ALL cookies!  This is CRUCIAL

        const token = req.cookies.token;
        console.log("Token:", token); // Log the actual token value

        if (!token) {
            console.log("No token found in cookies"); // Log if no token
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        try { // Inner try-catch for JWT verification
            const decoded = await jwt.verify(token, process.env.SECRET_KEY);
            console.log("Decoded token:", decoded); // Log the decoded payload
        } catch (jwtError) {
            console.error("JWT Verification Error:", jwtError); // Log JWT errors separately
            return res.status(401).json({ message: "Invalid token", success: false }); // More specific error
        }


        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Move this line outside the inner try-catch block

        const user = await User.findById(decoded.userId).select('-password');
        console.log("User found:", user); // Log the fetched user

        if (!user) {
            console.log("User not found in database"); // Log if user not found
            return res.status(401).json({ message: "User not found", success: false });
        }

        req.user = user;
        console.log("req.user set:", req.user); // Log req.user after it's set
        next();
        console.log("isAuthenticated middleware completed"); // Log completion

    } catch (error) {
        console.error("Authentication Error:", error); // Catch any other errors
        return res.status(401).json({ message: "Authentication failed", success: false, error: error.message });
    }
};

export default isAuthenticated;