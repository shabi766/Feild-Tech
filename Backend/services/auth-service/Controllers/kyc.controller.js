import { User } from "../Models/user.model.js";
import mongoose from "mongoose";

/**
 * Submit KYC Application (for user)
 */
export const submitKYC = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const { fatherName, cnicNumber, dateOfBirth, cnicFrontUrl, cnicBackUrl } = req.body;

        if (!fatherName || !cnicNumber || !dateOfBirth || !cnicFrontUrl || !cnicBackUrl) {
            return res.status(400).json({
                success: false,
                message: "All KYC fields are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update KYC details
        user.kyc = {
            fatherName,
            cnicNumber,
            dateOfBirth: new Date(dateOfBirth),
            cnicFrontUrl,
            cnicBackUrl,
            kycStatus: 'pending',
            submittedAt: new Date()
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC application submitted successfully",
            kyc: user.kyc
        });

    } catch (error) {
        console.error("Error submitting KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get KYC requests for administration
 */
export const getKYCRequests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        // Build filter object
        const filter = {};
        if (status && status !== 'all') filter['kyc.kycStatus'] = status;
        if (search) {
            filter.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get users with KYC data
        const kycRequests = await User.find(filter)
            .select('fullname email phoneNumber kyc createdAt profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalRequests = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                kycRequests,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalRequests / parseInt(limit)),
                    totalRequests,
                    hasNext: skip + kycRequests.length < totalRequests,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error("Error fetching KYC requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC requests",
            error: error.message
        });
    }
};

/**
 * Get KYC details (for admin review)
 */
export const getKYCDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('fullname email phoneNumber kyc profile');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            kyc: {
                ...user.kyc,
                user: {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                }
            }
        });

    } catch (error) {
        console.error("Error getting KYC details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Update KYC status (admin function)
 */
export const updateKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, remarks, rejectionReason } = req.body;
        const adminId = req.user.userId || req.user._id;

        // Validate status
        if (!['pending', 'verified', 'rejected', 'unverified'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'pending', 'verified', 'rejected', or 'unverified'"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update KYC status
        if (!user.kyc) user.kyc = {};
        user.kyc.kycStatus = status;
        if (remarks) user.kyc.remarks = remarks;
        if (rejectionReason) user.kyc.rejectionReason = rejectionReason;

        if (status === 'verified') {
            user.kyc.verifiedAt = new Date();
        } else if (status === 'rejected') {
            user.kyc.rejectedAt = new Date();
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `KYC status updated to ${status}`,
            kyc: {
                userId: user._id,
                kycStatus: user.kyc.kycStatus,
                remarks: user.kyc.remarks,
                verifiedAt: user.kyc.verifiedAt,
                rejectedAt: user.kyc.rejectedAt
            }
        });

    } catch (error) {
        console.error("Error updating KYC status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get all KYC applications (admin function)
 */
export const getAllKYC = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && ['unverified', 'pending', 'verified', 'rejected'].includes(status)) {
            query['kyc.kycStatus'] = status;
        }

        const skip = (page - 1) * limit;

        const [kycApplications, total] = await Promise.all([
            User.find(query)
                .select('fullname email phoneNumber kyc createdAt profile')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                kycApplications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error("Error getting all KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Get KYC statistics (admin function)
 */
export const getKYCStatistics = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$kyc.kycStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format statistics
        const formattedStats = {
            unverified: 0,
            pending: 0,
            verified: 0,
            rejected: 0,
            total: 0
        };

        stats.forEach(stat => {
            const status = stat._id || 'unverified';
            formattedStats[status] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: formattedStats
        });

    } catch (error) {
        console.error("Error getting KYC statistics:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

/**
 * Delete KYC application (admin function)
 */
export const deleteKYC = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Only allow deletion of unverified or rejected applications
        if (user.kyc?.kycStatus === 'verified' || user.kyc?.kycStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete verified or pending KYC applications"
            });
        }

        // Clear KYC data
        user.kyc = {
            kycStatus: 'unverified'
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC application deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
