import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { fullname, email }, { new: true });

        res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error" });
    }
};
