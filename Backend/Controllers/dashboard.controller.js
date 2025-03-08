import { Workorder } from '../Models/workorder.model.js';
import { Project } from '../Models/project.model.js';
import { User } from '../Models/user.model.js';
import { Chat } from '../Models/chat.model.js';
import { Notification } from '../Models/notification.model.js';

export const getDashboardStats = async (req, res) => {
    try {
        // ✅ Fetch Key Stats
        const ongoingProjectsCount = await Project.countDocuments();
        const completedJobsCount = await Workorder.countDocuments({ status: 'Completed' });
        const totalJobsCount = await Workorder.countDocuments();
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'online' });
        
        // ✅ Fetch Unread Messages Count
        const unreadMessages = await Chat.aggregate([
            { $match: { "messages.isRead": false } },
            { $unwind: "$messages" },
            { $match: { "messages.isRead": false } },
            { $count: "unreadCount" }
        ]);
        
        // ✅ Fetch Recent Activities (Limit to 5)
        const recentActivities = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("message createdAt");

        return res.status(200).json({
            ongoingProjects: ongoingProjectsCount,
            completedJobs: completedJobsCount,
            totalJobs: totalJobsCount,
            totalUsers,
            activeUsers,
            unreadMessages: unreadMessages.length > 0 ? unreadMessages[0].unreadCount : 0,
            recentActivities
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ 
            message: 'Error fetching dashboard stats', 
            error: error.message
        });
    }
};
