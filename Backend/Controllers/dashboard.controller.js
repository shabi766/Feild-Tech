import { Workorder } from '../Models/workorder.model.js';
import { User } from '../Models/user.model.js';
import { Company } from '../Models/company.model.js';
import { Application } from '../Models/application.model.js';
import mongoose from 'mongoose';

// Get company dashboard statistics
export const getCompanyDashboardStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log('Fetching dashboard stats for company ID:', companyId);

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.log('Invalid company ID format:', companyId);
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    // Get company information
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found for ID:', companyId);
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    console.log('Company found:', company.name);

    // Get all jobs posted by this company (using Company array field)
    const jobs = await Workorder.find({ 
      'Company': { $in: [companyId] }
    });
    
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

    // Get pending applications for company jobs
    const pendingApplications = await Application.countDocuments({
      Workorder: { $in: jobs.map(job => job._id) },
      status: 'pending'
    });

    // Get active projects (jobs in progress)
    const activeProjects = jobs.filter(job => 
      ['Active', 'In Progress', 'Assigned'].includes(job.status)
    ).length;

    // Calculate average rating (placeholder for now)
    const averageRating = 0; // TODO: Implement rating system

    // Calculate project success rate
    const projectSuccessRate = totalJobs > 0 
      ? Math.round((completedJobs / totalJobs) * 100)
      : 0;

    // Get recent jobs
    const recentJobs = await Workorder.find({ 
      'Company': { $in: [companyId] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description status totalSalary startTime endTime');

    // Get recent projects (for now, using jobs as projects)
    const recentProjects = await Workorder.find({ 
      'Company': { $in: [companyId] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description status startTime endTime');

    const stats = {
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue,
      totalTechnicians,
      pendingApplications,
      activeProjects,
      averageRating,
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

    if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recruiter ID'
      });
    }

    // Get all jobs posted by this individual recruiter
    const jobs = await Workorder.find({ 
      created_by: recruiterId,
      isIndividual: true 
    });

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

    // Get total applicants for all jobs
    const totalApplicants = await Application.countDocuments({
      Workorder: { $in: jobs.map(job => job._id) }
    });

    // Get unread messages (placeholder - would need chat system integration)
    const unreadMessages = 0; // TODO: Implement when chat system is ready

    // Get upcoming deadlines (jobs due within 7 days using startTime)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const upcomingDeadlines = jobs.filter(job => 
      job.startTime && new Date(job.startTime) <= sevenDaysFromNow
    ).length;

    // Calculate average rating (placeholder for now)
    const averageRating = 0; // TODO: Implement rating system

    // Total projects (same as total jobs for individual recruiters)
    const totalProjects = totalJobs;

    // Get recent jobs
    const recentJobs = await Workorder.find({ 
      created_by: recruiterId,
      isIndividual: true 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description status totalSalary startTime endTime');

    // Get recent applicants
    const recentApplications = await Application.aggregate([
      {
        $match: {
          Workorder: { $in: jobs.map(job => job._id) }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'applicant',
          foreignField: '_id',
          as: 'applicantData'
        }
      },
      {
        $unwind: '$applicantData'
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: '$applicantData.fullname',
          position: '$Workorder', // Using Workorder ID for now
          experience: { $literal: 'Not specified' }, // Placeholder
          rating: { $literal: 0 }, // Placeholder
          status: '$status',
          createdAt: '$createdAt'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ]);

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
