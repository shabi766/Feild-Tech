import { Workorder } from '../Models/workorder.model.js';
import { Project } from '../Models/project.model.js';
import { User } from '../Models/user.model.js';
import { Chat } from '../Models/chat.model.js';
import { Notification } from '../Models/notification.model.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?._id;
        const role = req.user?.role;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Unread messages for current user only
        const unreadAgg = await Chat.aggregate([
            { $match: { participants: userObjectId } },
            { $unwind: '$messages' },
            { $match: { 'messages.isRead': false, 'messages.sender': { $ne: userObjectId } } },
            { $count: 'unreadCount' }
        ]);
        const unreadMessages = unreadAgg.length > 0 ? unreadAgg[0].unreadCount : 0;

        // Recent notifications for current user
        const recentActivities = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('message createdAt type');

        if (role === 'Recruiter' || role === 'Admin') {
            // Jobs created by this recruiter/admin
            const totalJobs = await Workorder.countDocuments({ created_by: userId });
            const completedJobs = await Workorder.countDocuments({ created_by: userId, status: { $in: ['Done', 'Complete', 'Paid'] } });
            const activeJobs = await Workorder.countDocuments({ created_by: userId, status: { $in: ['Active', 'Assigned', 'In Progress', 'Review'] } });

            // Projects for this recruiter
            const totalProjects = await Project.countDocuments({ userId: userId });
            const ongoingProjects = totalProjects; // No status field available; treat all as ongoing

            return res.status(200).json({
                role: 'Recruiter',
                jobs: { total: totalJobs, completed: completedJobs, active: activeJobs },
                projects: { total: totalProjects, ongoing: ongoingProjects },
                messages: { unread: unreadMessages },
                recentActivities,
            });
        }

        // Technician metrics
        const jobsApplied = await (await import('../Models/application.model.js')).Application.countDocuments({ applicant: userId });
        const jobsAssigned = await Workorder.countDocuments({ assignedApplicant: userId });
        const jobsInProgress = await Workorder.countDocuments({ assignedApplicant: userId, status: { $in: ['Assigned', 'In Progress'] } });
        const jobsCompleted = await Workorder.countDocuments({ assignedApplicant: userId, status: { $in: ['Done', 'Complete', 'Paid'] } });

        return res.status(200).json({
            role: 'Technician',
            jobs: { applied: jobsApplied, assigned: jobsAssigned, inProgress: jobsInProgress, completed: jobsCompleted },
            messages: { unread: unreadMessages },
            recentActivities,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ 
            message: 'Error fetching dashboard stats', 
            error: error.message
        });
    }
};
