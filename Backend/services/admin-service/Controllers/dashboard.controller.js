import mongoose from 'mongoose';
import { WorkorderServiceClient } from '../Services/workorder-client.service.js';
import { AuthServiceClient } from '../Services/auth-client.service.js';
import { ReviewServiceClient } from '../Services/review-client.service.js';
import { ChatServiceClient } from '../Services/chat-client.service.js';
import Company from '../Models/company.model.js';
import Application from '../Models/application.model.js';

// Get company dashboard statistics
export const getCompanyDashboardStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    console.log('Fetching dashboard stats for company ID:', companyId);

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.log('Invalid company ID format:', companyId);
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    // Get company information (temporary - will use Company Service later)
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found for ID:', companyId);
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('Company found:', company.name);

    // Get all jobs posted by this company from Workorder Service
    const jobs = await WorkorderServiceClient.getWorkorders(
      { Company: [companyId] },
      token,
      { limit: 1000 }
    );

    console.log('Jobs found for company:', jobs.length);
    console.log('Job statuses:', jobs.map(job => job.status));

    // Calculate statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const completedJobs = jobs.filter(job => job.status === 'Complete').length;

    // Calculate total revenue (sum of all completed job salaries)
    const totalRevenue = jobs
      .filter(job => job.status === 'Complete')
      .reduce((sum, job) => sum + (job.totalSalary || 0), 0);

    // Get technicians working with this company (placeholder for now)
    const totalTechnicians = 0; // TODO: Implement when workHistory is available

    // Get pending applications for company jobs (temporary - will use Application Service later)
    const jobIds = jobs.map(job => job._id || job.id);
    const pendingApplications = await Application.countDocuments({
      Workorder: { $in: jobIds },
      status: 'pending'
    });

    // Get active projects (jobs in progress)
    const activeProjects = jobs.filter(job =>
      ['Active', 'In Progress', 'Assigned'].includes(job.status)
    ).length;

    // Get company ratings from Review Service
    let averageRating = 0;
    let totalReviews = 0;
    try {
      const ratingData = await ReviewServiceClient.getEntityRating('company', companyId, token);
      averageRating = Math.round(ratingData.averageRating * 10) / 10;
      totalReviews = ratingData.totalRatings;
    } catch (error) {
      console.log('Could not fetch company ratings:', error.message);
    }

    // Calculate project success rate
    const projectSuccessRate = totalJobs > 0
      ? Math.round((completedJobs / totalJobs) * 100)
      : 0;

    // Get recent jobs
    const recentJobs = jobs
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
      .slice(0, 5)
      .map(job => ({
        title: job.title,
        description: job.description,
        status: job.status,
        totalSalary: job.totalSalary,
        startTime: job.startTime,
        endTime: job.endTime
      }));

    // Get recent projects (for now, using jobs as projects)
    const recentProjects = recentJobs;

    const stats = {
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue,
      totalTechnicians,
      pendingApplications,
      activeProjects,
      averageRating,
      totalReviews,
      projectSuccessRate
    };

    res.json({
      success: true,
      stats,
      recentJobs,
      recentProjects
    });

  } catch (error) {
    console.error('Error fetching company dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get individual recruiter dashboard statistics
export const getIndividualRecruiterDashboardStats = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recruiter ID'
      });
    }

    // Get all jobs posted by this individual recruiter from Workorder Service
    const jobs = await WorkorderServiceClient.getWorkorders(
      { created_by: recruiterId, isIndividual: true },
      token,
      { limit: 1000 }
    );

    // Calculate statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const completedJobs = jobs.filter(job => job.status === 'Complete').length;

    // Calculate total earnings (sum of all completed job salaries)
    const totalEarnings = jobs
      .filter(job => job.status === 'Complete')
      .reduce((sum, job) => sum + (job.totalSalary || 0), 0);

    // Calculate pending payments (sum of all active job salaries)
    const pendingPayments = jobs
      .filter(job => job.status === 'Active')
      .reduce((sum, job) => sum + (job.totalSalary || 0), 0);

    // Get total applicants for all jobs (temporary - will use Application Service later)
    const jobIds = jobs.map(job => job._id || job.id);
    const totalApplicants = await Application.countDocuments({
      Workorder: { $in: jobIds }
    });

    // Get unread messages (placeholder - would need chat system integration)
    let unreadMessages = 0;
    try {
      unreadMessages = await ChatServiceClient.getUnreadMessageCount(recruiterId, token);
    } catch (error) {
      console.log('Could not fetch unread messages:', error.message);
    }

    // Get upcoming deadlines (jobs due within 7 days using startTime)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = jobs.filter(job =>
      job.startTime && new Date(job.startTime) <= sevenDaysFromNow
    ).length;

    // Get recruiter ratings from Review Service
    let averageRating = 0;
    let totalReviews = 0;
    try {
      const ratingData = await ReviewServiceClient.getEntityRating('company', recruiterId, token);
      averageRating = Math.round(ratingData.averageRating * 10) / 10;
      totalReviews = ratingData.totalRatings;
    } catch (error) {
      console.log('Could not fetch recruiter ratings:', error.message);
    }

    // Total projects (same as total jobs for individual recruiters)
    const totalProjects = totalJobs;

    // Get recent jobs
    const recentJobs = jobs
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
      .slice(0, 5)
      .map(job => ({
        title: job.title,
        description: job.description,
        status: job.status,
        totalSalary: job.totalSalary,
        startTime: job.startTime,
        endTime: job.endTime
      }));

    // Get recent applicants (temporary - will use Application Service later)
    const recentApplicationsData = await Application.find({
      Workorder: { $in: jobIds }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Fetch applicant user data from Auth Service
    const applicantIds = recentApplicationsData.map(app => app.applicant);
    let applicants = [];

    if (applicantIds.length > 0 && token) {
      try {
        applicants = await AuthServiceClient.getUsers(applicantIds, token);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    }

    // Map applications with user data
    const recentApplications = recentApplicationsData.map(app => {
      const applicant = applicants.find(u =>
        (u._id || u.id)?.toString() === app.applicant?.toString()
      );

      return {
        id: app._id,
        name: applicant?.fullname || 'Unknown',
        position: app.Workorder, // Using Workorder ID for now
        experience: 'Not specified', // Placeholder
        rating: 0, // Placeholder
        status: app.status,
        createdAt: app.createdAt
      };
    });

    const stats = {
      totalJobs,
      activeJobs,
      completedJobs,
      totalEarnings,
      pendingPayments,
      totalApplicants,
      unreadMessages,
      upcomingDeadlines,
      averageRating,
      totalReviews,
      totalProjects
    };

    res.json({
      success: true,
      stats,
      recentJobs,
      recentApplicants: recentApplications
    });

  } catch (error) {
    console.error('Error fetching individual recruiter dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
