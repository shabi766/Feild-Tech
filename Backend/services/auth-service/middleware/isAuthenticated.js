import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }
        req.id = decode.userId;

        // Populate user in req if needed
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found",
                success: false
            });
        }
        req.user = user;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Authentication failed",
            success: false,
            error: error.message
        });
    }
}
export default isAuthenticated;
