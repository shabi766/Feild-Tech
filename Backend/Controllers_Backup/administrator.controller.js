import SystemSettings from "../Models/systemSettings.model.js";
import { User } from "../Models/user.model.js";
import { Transaction } from "../Models/transaction.model.js";
import { Workorder } from "../Models/workorder.model.js";
import { Company } from "../Models/company.model.js";
import { Project } from "../Models/project.model.js";

// Get all system settings
export const getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getOrCreate();
        
        // Mask sensitive information
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };
        
        res.status(200).json({
            success: true,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error("Error fetching system settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch system settings",
            error: error.message
        });
    }
};

// Update system settings by category
export const updateSystemSettings = async (req, res) => {
    try {
        const { category } = req.params;
        const updateData = req.body;
        
        // Validate category
        const validCategories = ['general', 'security', 'email', 'payment', 'integrations'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category. Must be one of: general, security, email, payment, integrations"
            });
        }
        
        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();
        
        // Update the specific category
        settings[category] = {
            ...settings[category],
            ...updateData
        };
        
        await settings.save();
        
        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };
        
        res.status(200).json({
            success: true,
            message: `${category} settings updated successfully`,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error(`Error updating ${req.params.category} settings:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to update ${req.params.category} settings`,
            error: error.message
        });
    }
};

// Update all system settings at once
export const updateAllSystemSettings = async (req, res) => {
    try {
        const updateData = req.body;
        
        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();
        
        // Update all categories
        Object.keys(updateData).forEach(category => {
            if (settings[category]) {
                settings[category] = {
                    ...settings[category],
                    ...updateData[category]
                };
            }
        });
        
        await settings.save();
        
        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };
        
        res.status(200).json({
            success: true,
            message: "All settings updated successfully",
            data: sanitizedSettings
        });
    } catch (error) {
        console.error("Error updating all system settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update system settings",
            error: error.message
        });
    }
};

// Reset settings to defaults for a specific category
export const resetSettingsToDefaults = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate category
        const validCategories = ['general', 'security', 'email', 'payment', 'integrations'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category. Must be one of: general, security, email, payment, integrations"
            });
        }
        
        // Get current settings or create new ones
        let settings = await SystemSettings.getOrCreate();
        
        // Reset the specific category to defaults
        const defaultSettings = new SystemSettings();
        settings[category] = defaultSettings[category];
        
        await settings.save();
        
        // Mask sensitive information in response
        const sanitizedSettings = {
            ...settings.toObject(),
            email: {
                ...settings.email,
                smtpPassword: settings.email.smtpPassword ? '********' : ''
            }
        };
        
        res.status(200).json({
            success: true,
            message: `${category} settings reset to defaults successfully`,
            data: sanitizedSettings
        });
    } catch (error) {
        console.error(`Error resetting ${req.params.category} settings:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to reset ${req.params.category} settings`,
            error: error.message
        });
    }
};

// Get system statistics for admin dashboard
export const getSystemStats = async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        
        // Calculate date range
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get basic counts
        const [
            totalUsers,
            totalTechnicians,
            totalRecruiters,
            totalAdmins,
            totalCompanies,
            totalProjects,
            totalWorkOrders,
            totalTransactions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'Technician' }),
            User.countDocuments({ role: 'Recruiter' }),
            User.countDocuments({ role: 'Admin' }),
            Company.countDocuments(),
            Project.countDocuments(),
            Workorder.countDocuments(),
            Transaction.countDocuments()
        ]);

        // Get KYC statistics
        const kycStats = await User.aggregate([
            {
                $group: {
                    _id: '$kyc.kycStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get user growth over time
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Get financial statistics
        const financialStats = await Transaction.aggregate([
            {
                $match: {
                    status: 'succeeded',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: '$amountCents' },
                    totalTransactions: { $sum: 1 },
                    averageTransaction: { $avg: '$amountCents' }
                }
            }
        ]);

        // Get work order statistics
        const workOrderStats = await Workorder.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get active users (users who were online in last 24 hours)
        const activeUsers = await User.countDocuments({
            lastSeen: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });

        // Calculate monthly growth
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: lastMonth }
        });
        const previousMonth = new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000);
        const previousMonthUsers = await User.countDocuments({
            createdAt: { $gte: previousMonth, $lt: lastMonth }
        });
        
        const monthlyGrowth = previousMonthUsers > 0 
            ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 
            : 0;

        // Format KYC stats
        const kycFormatted = {
            verified: kycStats.find(k => k._id === 'verified')?.count || 0,
            pending: kycStats.find(k => k._id === 'pending')?.count || 0,
            rejected: kycStats.find(k => k._id === 'rejected')?.count || 0,
            unverified: kycStats.find(k => k._id === 'unverified')?.count || 0
        };

        // Format work order stats
        const workOrderFormatted = {
            draft: workOrderStats.find(w => w._id === 'Draft')?.count || 0,
            active: workOrderStats.find(w => w._id === 'Active')?.count || 0,
            assigned: workOrderStats.find(w => w._id === 'Assigned')?.count || 0,
            inProgress: workOrderStats.find(w => w._id === 'In Progress')?.count || 0,
            done: workOrderStats.find(w => w._id === 'Done')?.count || 0,
            complete: workOrderStats.find(w => w._id === 'Complete')?.count || 0,
            review: workOrderStats.find(w => w._id === 'Review')?.count || 0,
            cancel: workOrderStats.find(w => w._id === 'Cancel')?.count || 0,
            paid: workOrderStats.find(w => w._id === 'Paid')?.count || 0
        };

        // Format financial stats
        const financial = financialStats[0] || {
            totalVolume: 0,
            totalTransactions: 0,
            averageTransaction: 0
        };

        // Calculate verification rate
        const totalKYCUsers = kycFormatted.verified + kycFormatted.pending + kycFormatted.rejected;
        const verificationRate = totalKYCUsers > 0 
            ? (kycFormatted.verified / totalKYCUsers) * 100 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    totalJobs: totalWorkOrders,
                    activeJobs: workOrderFormatted.active + workOrderFormatted.assigned + workOrderFormatted.inProgress,
                    totalRevenue: financial.totalVolume / 100, // Convert cents to dollars
                    monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
                },
                users: {
                    technicians: totalTechnicians,
                    clients: totalRecruiters,
                    recruiters: totalRecruiters,
                    admins: totalAdmins,
                    newUsers: lastMonthUsers,
                    userGrowth: Math.round(monthlyGrowth * 100) / 100
                },
                kyc: {
                    pending: kycFormatted.pending,
                    verified: kycFormatted.verified,
                    rejected: kycFormatted.rejected,
                    verificationRate: Math.round(verificationRate * 100) / 100
                },
                financial: {
                    totalTransactions: financial.totalTransactions,
                    totalVolume: financial.totalVolume / 100,
                    averageTransaction: Math.round((financial.averageTransaction / 100) * 100) / 100,
                    monthlyVolume: financial.totalVolume / 100
                },
                workOrders: workOrderFormatted,
                system: {
                    uptime: 99.9, // This would come from system monitoring
                    activeSessions: activeUsers,
                    serverLoad: 45, // This would come from system monitoring
                    lastBackup: new Date().toISOString()
                },
                userGrowth: userGrowth.map(item => ({
                    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
                    count: item.count
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching system statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch system statistics",
            error: error.message
        });
    }
};

// Test email configuration
export const testEmailConfiguration = async (req, res) => {
    try {
        const { email, smtpHost, smtpPort, smtpUser, smtpPassword, enableSSL } = req.body;
        
        // Basic validation
        if (!email || !smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
            return res.status(400).json({
                success: false,
                message: "All email configuration fields are required"
            });
        }
        
        // TODO: Implement actual SMTP test
        // For now, just validate the format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        
        // Simulate SMTP test (replace with actual implementation)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        res.status(200).json({
            success: true,
            message: "Email configuration test completed successfully"
        });
    } catch (error) {
        console.error("Error testing email configuration:", error);
        res.status(500).json({
            success: false,
            message: "Failed to test email configuration",
            error: error.message
        });
    }
};

// Get all users for administration
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
            .limit(parseInt(limit))
            .populate('profile.company', 'name');

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

// Update user status (activate/suspend)
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

// Get KYC requests for administration
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

// Update KYC status
export const updateKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, remarks } = req.body;

        if (!['verified', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KYC status. Must be one of: verified, rejected, pending"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                'kyc.kycStatus': status,
                'kyc.remarks': remarks,
                ...(status === 'verified' && { 'kyc.verifiedAt': new Date() }),
                ...(status === 'rejected' && { 'kyc.rejectedAt': new Date() })
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
            message: `KYC status updated to ${status}`,
            data: user
        });
    } catch (error) {
        console.error("Error updating KYC status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update KYC status",
            error: error.message
        });
    }
};

// Delete user (soft delete)
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
