import { User } from "../Models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Get all users for administration
 */
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, kycStatus, search } = req.query;
        
        // Build filter object
        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (status && status !== 'all') filter.status = status;
        if (kycStatus && kycStatus !== 'all') filter['kyc.kycStatus'] = kycStatus;
        if (search) {
            filter.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get users with pagination
        const users = await User.find(filter)
            .select('-password -resetPasswordOtp -resetPasswordOtpExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalUsers = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / parseInt(limit)),
                    totalUsers,
                    hasNext: skip + users.length < totalUsers,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

/**
 * Update user status (activate/suspend)
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'suspended', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: active, suspended, inactive"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status,
                ...(status === 'suspended' && { suspensionReason: reason }),
                ...(status === 'suspended' && { suspendedAt: new Date() })
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            data: user
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: error.message
        });
    }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status: 'deleted',
                deletedAt: new Date(),
                deletionReason: reason
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { fullname, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { fullname, email }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Profile updated", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId || req.user._id;
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Incorrect old password" 
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ 
            success: true,
            message: "Password changed successfully" 
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Get technicians
 */
export const getTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({ role: 'Technician' })
            .select('-password')
            .sort({ createdAt: -1 });

        if (!technicians || technicians.length === 0) {
            return res.status(404).json({
                message: 'No technicians found.',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Technicians fetched successfully.',
            success: true,
            technicians,
        });
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return res.status(500).json({
            message: 'Failed to fetch technicians.',
            success: false,
            error: error.message,
        });
    }
};

/**
 * Get technician by ID
 */
export const getTechnicianById = async (req, res) => {
    const { id } = req.params;

    try {
        const technician = await User.findById(id).select('-password');

        if (!technician || technician.role !== 'Technician') {
            return res.status(404).json({
                message: 'Technician not found.',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Technician fetched successfully.',
            success: true,
            technician,
        });
    } catch (error) {
        console.error('Error fetching technician:', error);
        return res.status(500).json({
            message: 'Failed to fetch technician.',
            success: false,
            error: error.message,
        });
    }
};
