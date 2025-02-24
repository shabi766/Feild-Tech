import { Workorder } from '../Models/workorder.model.js';
import { Project } from '../Models/project.model.js';

export const getDashboardStats = async (req, res) => {
    try {
        const ongoingProjectsCount = await Project.countDocuments({ status: 'Active' });
        const completedJobsCount = await Workorder.countDocuments({ status: 'Completed' });
        const totalJobsCount = await Workorder.countDocuments();

        return res.status(200).json({
            ongoingProjects: ongoingProjectsCount,
            completedJobs: completedJobsCount,
            totalJobs: totalJobsCount,
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error); // Log the full error
        return res.status(500).json({ 
            message: 'Error fetching dashboard stats', 
            error: error.message // Include the error message for debugging
        });
    }
};