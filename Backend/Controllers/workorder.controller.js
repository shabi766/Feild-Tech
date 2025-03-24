import { Workorder } from "../Models/workorder.model.js";
import { Client } from "../Models/client.model.js";
import { Project } from "../Models/project.model.js";
import { Application } from "../Models/application.model.js";
import mongoose from 'mongoose';

// Constants for job statuses
const JOB_STATUSES = ['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Review', 'Complete', 'Cancel', 'Paid'];

// Function to validate required fields
const validateJobFields = (fields, status) => {
    const requiredFields = ['title', 'description', 'totalSalary', 'skills', 'street', 'city', 'state', 'postalCode', 'country', 'jobType', 'startTime', 'endTime'];
    const errors = {};

    if (status !== 'Draft') {
        requiredFields.forEach(field => {
            if (!fields[field]) {
                errors[field] = `${field} is required.`;
            }
        });
    }

    return errors;
};

const findClientAndProject = async (clientId, projectId) => {
    const client = await Client.findById(clientId);
    if (!client) throw new Error(`Client with ID '${clientId}' not found in the database`);

    if (!projectId || projectId === "") {
        return { client, project: null }; // Return null project if projectId is empty
    }

    const project = await Project.findById(projectId);
    if (!project) throw new Error(`Project with ID '${projectId}' not found in the database`);

    return { client, project };
};

export const postJob = async (req, res) => {
    try {
        let {
            title, template, clientName, projectName,
            description, requiredTools, skills,
            jobType, partTimeOptions, fullTimeOptions,
            rate, rateType,
            street, city, state, postalCode, country,
            startTime, endTime, status, totalJobTime, totalJobDuration
        } = req.body;

        const userId = req.user._id;

        const errors = validateJobFields(req.body, status);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Please Fill All Feilds", errors, success: false });
        }

        // Find client and project
        let client, project;
        try {
            const { client: foundClient, project: foundProject } = await findClientAndProject(clientName, projectName);
            client = foundClient;
            project = foundProject;
        } catch (findError) {
            return res.status(400).json({ message: findError.message, success: false });
        }

        // Data transformation and validation
        template = template || null;
        totalJobTime = totalJobTime || null;
        projectName = project ? project._id : null; // Now project is defined
        jobType = jobType || null;
        requiredTools = requiredTools ? requiredTools.split(",").map(tool => tool.trim()) : [];
        skills = skills ? skills.split(",").map(skill => skill.trim()) : [];

        // Salary Calculation Logic
        let totalSalary = 0;
        let salary = {}; //initialize salary object
        if (rateType === 'fixed') {
            totalSalary = parseInt(rate);
            salary = { fixed: totalSalary };
        } else if (rateType === 'hourly') {
            if (jobType === 'part-time' && partTimeOptions && partTimeOptions.base === 'hourly') {
                totalSalary = parseInt(rate) * parseInt(partTimeOptions.hourlyHours);
                salary = { partTime: { hourlyRate: parseInt(rate) } };
            } else if (jobType === 'part-time' && partTimeOptions && partTimeOptions.base === 'daily') {
                totalSalary = parseInt(rate) * parseInt(partTimeOptions.dailyDays);
                salary = { partTime: { dailyRate: parseInt(rate) } };
            } else if (jobType === 'part-time' && partTimeOptions && partTimeOptions.base === 'contract') {
                totalSalary = parseInt(rate) * parseInt(partTimeOptions.contractMonths);
                salary = { partTime: { contractRate: parseInt(rate) } };
            } else if (jobType === 'part-time' && partTimeOptions && partTimeOptions.base === 'weekly') {
                totalSalary = parseInt(rate) * (parseInt(partTimeOptions.weeklyDays) * 7);
                salary = { partTime: { weeklyRate: parseInt(rate) } };
            }
        }

        const jobData = {
            title,
            template,
            description,
            requiredTools,
            skills,
            jobType,
            partTimeOptions: jobType === 'part-time' ? partTimeOptions : undefined,
            fullTimeOptions: jobType === 'full-time' ? fullTimeOptions : undefined,
            totalSalary,
            location: { street, city, state, postalCode, country },
            created_by: userId,
            startTime: startTime ? new Date(startTime) : null,
            endTime: endTime ? new Date(endTime) : null,
            totalJobTime,
            totalJobDuration,
            status: status || 'Draft',
            clientName: client ? client._id : null,
            projectName: projectName,
            isIndividual: !projectName,
            salary: salary, //add salary object to job data.
        };

        const job = await Workorder.create(jobData);
        return res.status(201).json({ message: "New job created successfully", job, success: true });
    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ message: error.message, success: false, error: error.message });
    }
};
// API to fetch jobs created by the logged-in user (for calendar)
export const getUserJobs = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobs = await Workorder.find({ created_by: userId }).populate('clientName').populate('projectName');

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No jobs found for this user',
            });
        }

        return res.status(200).json({
            success: true,
            jobs,
        });
    } catch (error) {
        console.error('Error fetching user jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching jobs',
            error: error.message,
        });
    }
};

// Existing functionality to get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Workorder.find(query).populate('clientName').sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.error("Error getting all jobs:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message
        });
    }
};

// Existing functionality to get a job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false,
            });
        }

        const job = await Workorder.findById(jobId)
            .populate("clientName")
            .populate("projectName")
            .populate({
                path: "Application",
                populate: { path: "applicant" },
            })
            .populate("assignedApplicant");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error("Error getting job by ID:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message,
        });
    }
};

// Existing functionality to get admin-created jobs
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.user._id;
        const jobs = await Workorder.find({ created_by: adminId }).populate('clientName').sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.error("Error getting admin jobs:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message
        });
    }
};

// Controller to update a job by ID
export const updateJob = async (req, res) => {
    const jobId = req.params.id;
    const updates = req.body;

    try {
        const updatedJob = await Workorder.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found', success: false });
        }

        return res.status(200).json({ message: 'Job updated successfully', job: updatedJob, success: true });
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json({ message: 'Server error while updating job', success: false, error: error.message });
    }
};

// Controller to update job status by ID
export const updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const validStatuses = ['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status', success: false });
        }

        let updateData = { status };
        if (status === 'Complete') {
            updateData.completeTime = new Date();
        }
        if (status === 'Paid') {
            updateData.paidTime = new Date();
        }

        const job = await Workorder.findByIdAndUpdate(id, updateData, { new: true });

        if (!job) {
            return res.status(404).json({ message: 'Job not found', success: false });
        }

        return res.status(200).json({ message: 'Job status updated successfully', job, success: true });
    } catch (error) {
        console.error('Error updating job status:', error);
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

export const checkinJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'In Progress', checkinTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job checked in successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

export const checkoutJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findById(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found', success: false });
        }

        if (!job.checkinTime) {
            return res.status(400).json({ message: 'Job has not been checked in', success: false });
        }

        const checkoutTime = new Date();
        const timeSpent = checkoutTime - job.checkinTime; // Time in milliseconds

        const updatedJob = await Workorder.findByIdAndUpdate(
            id,
            {
                
                checkoutTime: checkoutTime,
                timeSpent: timeSpent,
            },
            { new: true }
        );

        return res.status(200).json({ message: 'Job checked out successfully', job: updatedJob, success: true });
    } catch (error) {
        console.error('Error checking out job:', error);
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};


export const doneJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Done', doneTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job marked done successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};
export const completeJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Complete', doneTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job marked Complete successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};
export const ReviewJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Review', doneTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job marked Review successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};
export const cancelJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Cancel', doneTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job marked Cancel successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};
export const PaidJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Paid', doneTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job marked Paid successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

export const getJobsByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const jobs = await Workorder.find({ projectName: projectId })
            .populate(['clientName', 'projectName']);
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'No jobs found for this project' });
        }
        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs by project:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getTechnicianJobs = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all jobs
        const jobs = await Workorder.find({
            $or: [
                { Application: { $elemMatch: { applicant: userId } } }, // Applied jobs
                { assignedApplicant: userId } // Assigned jobs
            ]
        }).populate('Application');

        // Categorize jobs
        const appliedJobs = jobs.filter(job =>
            job.Application.some(app => app.applicant && app.applicant.toString() === userId.toString()) && job.assignedApplicant == null
        );

        const assignedJobs = jobs.filter(job => job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() && job.status === 'Assigned');

        const inProgressJobs = jobs.filter(job => job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() && job.status === 'In Progress');

        const completedJobs = jobs.filter(job => job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() && (job.status === 'Complete' || job.status === 'Done'));

        res.status(200).json({
            appliedJobs,
            assignedJobs,
            inProgressJobs,
            completedJobs,
            success: true
        });
    } catch (error) {
        console.error("Error fetching technician jobs:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};


export const getDraftJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false,
            });
        }

        const job = await Workorder.findById(jobId)
            .populate("clientName")
            .populate("projectName")
            .populate({
                path: "Application",
                populate: { path: "applicant" },
            })
            .populate("assignedApplicant");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        if (job.status !== 'Draft') {
            return res.status(400).json({
                message: "Job is not a draft",
                success: false,
            })
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error("Error getting draft job by ID:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message,
        });
    }
};

export const calculatePayable = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Workorder.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        if (job.status !== "Done" || job.jobType !== "part-time" || !job.partTimeOptions || job.partTimeOptions.base !== "hourly") {
            return res.status(400).json({ message: "Calculation not applicable for this job", success: false });
        }

        const checkInTime = job.checkinTime;
        const checkOutTime = job.checkoutTime;
        const hourlyRate = job.salary?.partTime?.hourlyRate;

        if (!checkInTime || !checkOutTime || !hourlyRate) {
            return res.status(400).json({ message: "Missing check-in, check-out, or hourly rate", success: false });
        }

        const checkInDate = new Date(checkInTime);
        const checkOutDate = new Date(checkOutTime);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ message: "Invalid check-in or check-out time", success: false });
        }

        const differenceInMilliseconds = checkOutDate.getTime() - checkInDate.getTime();
        if (differenceInMilliseconds <= 0) {
            return res.status(400).json({ message: "Invalid time range", success: false });
        }

        const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
        let hours = differenceInMinutes / 60;

        if (hours < 1) {
            hours = 1;
        }

        let payableHours = Math.floor(hours);
        const remainingMinutes = differenceInMinutes % 60;

        if (hours > 1 && remainingMinutes >= 30) {
            payableHours += 0.5;
        }

        const payableSalary = payableHours * hourlyRate;

        res.status(200).json({
            success: true,
            payableHours,
            payableSalary,
        });

    } catch (error) {
        console.error("Error calculating payable:", error);
        res.status(500).json({ message: error.message, success: false });
    }
};