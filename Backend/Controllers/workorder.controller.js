import { Workorder } from "../Models/workorder.model.js";
import { Client } from "../Models/client.model.js";
import { Project } from "../Models/project.model.js";
import {Application} from "../Models/application.model.js"
import mongoose from 'mongoose';

// Constants for job statuses (no change)
const JOB_STATUSES = ['Draft', 'Active', 'Assigned', 'Checkin', 'Checkout', 'Done', 'Review', 'Complete', 'Cancel', 'Paid'];

// Function to validate required fields (no change)
const validateJobFields = (fields) => {
    const requiredFields = ['title', 'description', 'totalSalary', 'skills', 'street', 'city', 'state', 'postalCode', 'country', 'jobType', 'startTime', 'endTime'];
    const errors = {};

    requiredFields.forEach(field => {
        if (!fields[field]) {
            errors[field] = `${field} is required.`;
        }
    });

    return errors;
};

const findClientAndProject = async (clientId, projectId) => {
    const client = await Client.findById(clientId);
    if (!client) throw new Error(`Client with ID '${clientId}' not found in the database`);

    const project = await Project.findById(projectId);
    if (!project) throw new Error(`Project with ID '${projectId}' not found in the database`);

    return { client, project };
};

export const postJob = async (req, res) => {
    try {
        const {
            title, template, clientName, projectName,
            description, requiredTools, skills,
            jobType, partTimeOptions, fullTimeOptions,
            totalSalary, street, city, state, postalCode, country,
            startTime, endTime, status, totalJobTime, totalJobDuration
        } = req.body;

        const userId = req.user._id; // Use req.user._id (consistent)

        const errors = validateJobFields(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Validation failed", errors, success: false });
        }

        const { client, project } = await findClientAndProject(clientName, projectName);

        const jobData = {
            title,
            template,
            description,
            requiredTools: requiredTools ? requiredTools.split(",").map(tool => tool.trim()) : [],
            skills: skills.split(",").map(skill => skill.trim()),
            jobType,
            partTimeOptions: jobType === 'part-time' ? partTimeOptions : undefined,
            fullTimeOptions: jobType === 'full-time' ? fullTimeOptions : undefined,
            totalSalary,
            location: { street, city, state, postalCode, country },
            created_by: userId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            totalJobTime,
            totalJobDuration,
            status: status || 'Draft',
            clientName: client._id, // Store client _id
            projectName: project ? project._id : null, // Store project _id
            isIndividual: !projectName
        };

        const job = await Workorder.create(jobData);
        return res.status(201).json({ message: "New job created successfully", job, success: true });
    } catch (error) {
        console.error('Error creating job:', error); // Log the full error object
        return res.status(500).json({ message: error.message, success: false, error: error.message }); // Send error message
    }
};


// ... Other functions remain unchanged

// New API to fetch jobs created by the logged-in user (for calendar)
export const getUserJobs = async (req, res) => {
    try {
        const userId = req.user._id; // Use req.user._id (consistent)
        const jobs = await Workorder.find({ created_by: userId }).populate('clientName').populate('projectName'); // Populate both client and project

        if (!jobs || jobs.length === 0) { // Check for both null and empty array
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
            error: error.message, // Include error message
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
        const jobs = await Workorder.find(query).populate('clientName').sort({ createdAt: -1 }); // Populate client

        if (!jobs || jobs.length === 0) { // Check for both null and empty array
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
            error: error.message // Include error message
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
            .populate("assignedApplicant"); // Populate assigned user

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
        const adminId = req.user._id; // Use req.user._id (consistent)
        const jobs = await Workorder.find({ created_by: adminId }).populate('clientName').sort({ createdAt: -1 }); // Populate client

        if (!jobs || jobs.length === 0) { // Check for both null and empty array
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
            error: error.message // Include error message
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
        return res.status(500).json({ message: 'Server error while updating job', success: false, error: error.message }); // Include error message
    }
};

// Controller to update job status by ID
export const updateJobStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const validStatuses = ['Draft', 'Active', 'Assigned', 'Checkin', 'Checkout', 'Done', 'Complete', 'Review', 'Cancel', 'Paid'];
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
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Checkin', checkinTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job checked in successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

export const checkoutJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Checkout', checkoutTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });
        return res.status(200).json({ message: 'Job checked out successfully', job, success: true });
    } catch (error) {
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
        const jobs = await Workorder.find({ projectName: projectId }) // Use projectId here
          .populate([ 'clientName', 'projectName' ]); // Populate both client and project
    
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
        const userId = req.user._id; // Logged-in technician ID

        // Fetch jobs technician applied for
        const appliedJobs = await Application.find({ applicant: userId })
            .populate({
                path: "Workorder",
                populate: { path: "created_by", select: "fullname email" }
            })
            .sort({ createdAt: -1 });

        // Fetch jobs assigned to technician
        const assignedJobs = await Workorder.find({ assignedApplicant: userId, status: "Assigned" })
            .populate({
                path: "created_by",
                select: "fullname email"
            })
            .sort({ createdAt: -1 });

        // Fetch completed jobs by technician
        const completedJobs = await Workorder.find({ assignedApplicant: userId, status: "Completed" })
            .populate({
                path: "created_by",
                select: "fullname email"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            appliedJobs,
            assignedJobs,
            completedJobs,
        });

    } catch (error) {
        console.error("Error fetching technician jobs:", error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
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