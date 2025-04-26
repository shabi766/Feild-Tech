import { Workorder } from "../Models/workorder.model.js";
import { Client } from "../Models/client.model.js";
import { Project } from "../Models/project.model.js";
import { Application } from "../Models/application.model.js";
import mongoose from 'mongoose';
import AWS from 'aws-sdk';
import { multipleUpload } from "../middleware/multer.js";


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = (file) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `jobs/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`, // Sanitize filename
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Adjust ACL as needed
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error("Error uploading to S3:", err);
                reject(err);
            } else {
                resolve(data.Location); // Return the S3 URL
            }
        });
    });
};

// Constants for job statuses
const JOB_STATUSES = ['Draft', 'Active', 'Assigned', 'In Progress', 'Done', 'Review', 'Complete', 'Cancel', 'Paid'];

// Function to validate required fields
const validateJobFields = (fields, status) => {
    const requiredFields = ['title', 'description', 'skills', 'street', 'city', 'state', 'postalCode', 'country', 'jobType', 'startTime', 'endTime'];
    const errors = {};

    if (status !== 'Draft') {
        requiredFields.forEach(field => {
            if (!fields[field]) {
                errors[field] = `${field} is required.`;
            }
        });
        if (fields.jobType === 'full-time' && (!fields.rate || fields.rateType !== 'contract' || !fields.fullTimeOptions?.contractMonths)) {
            errors.salaryDetails = "Rate, contract type (contract), and contract months are required for full-time contract jobs.";
        } else if (fields.jobType === 'part-time' && (!fields.rate || !fields.rateType || !fields.partTimeOptions?.base)) {
            errors.salaryDetails = "Rate, rate type, and part-time base are required for part-time jobs.";
        }
    
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
    const uploadMiddleware = multipleUpload; // Use your multipleUpload middleware

    uploadMiddleware(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(400).json({ message: "Error uploading file(s)", success: false, error: err.message });
        }

        try {
            let {
                title, template, clientName, projectName, IncidentID, Teams,
                description, confidential, requiredTools, skills,
                jobType, partTimeOptions, fullTimeOptions,
                rate, rateType,
                street, city, state, postalCode, country,
                startTime, endTime, status, totalJobTime, totalJobDuration,
                siteContact,  // Get siteContact from request body
                SecondaryContact, // Get SecondaryContact from request body
                customFields,
                tasks
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
            projectName = project ? project._id : null;
            jobType = jobType || null;
            requiredTools = requiredTools ? requiredTools.split(",").map(tool => tool.trim()) : [];
            skills = skills ? skills.split(",").map(skill => skill.trim()) : [];

            // Salary Calculation Logic
            let totalSalary = 0;
            let salary = {};

            if (jobType === 'full-time' && fullTimeOptions && fullTimeOptions.contractMonths && rate && rateType === 'contract') {
                totalSalary = parseInt(rate) * parseInt(fullTimeOptions.contractMonths);
                salary = { fullTime: { contractRate: parseInt(rate) } };
            } else if (jobType === 'part-time' && partTimeOptions && rate) {
                switch (partTimeOptions.base) {
                    case 'hourly':
                        if (rateType === 'hourly') {
                            salary = { partTime: { hourlyRate: parseInt(rate) } };
                        } else if (rateType === 'fixed') {
                            salary = { partTime: { fixedHourlyRate: parseInt(rate) } };
                        }
                        break;
                    case 'daily':
                        if (rateType === 'daily') {
                            salary = { partTime: { dailyRate: parseInt(rate) } };
                        } else if (rateType === 'fixed') {
                            salary = { partTime: { fixedDailyRate: parseInt(rate) } };
                        }
                        break;
                    case 'weekly':
                        if (rateType === 'weekly') {
                            salary = { partTime: { weeklyRate: parseInt(rate) } };
                        } else if (rateType === 'fixed') {
                            salary = { partTime: { fixedWeeklyRate: parseInt(rate) } };
                        }
                        break;
                    case 'monthly':
                        if (rateType === 'monthly') {
                            salary = { partTime: { monthlyRate: parseInt(rate) } };
                        } else if (rateType === 'fixed') {
                            salary = { partTime: { fixedMonthlyRate: parseInt(rate) } };
                        }
                        break;
                    default:
                        return res.status(400).json({ message: 'Invalid part-time base', success: false });
                }
            }

            let attachments = [];
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        const s3Url = await uploadToS3(file);
                        attachments.push({ name: file.originalname, url: s3Url });
                    } catch (uploadError) {
                        return res.status(500).json({ message: "Error uploading files to S3", success: false, error: uploadError.message });
                    }
                }
            }
            // Ensure customFields is an array, parse if it's a string, and ensure each field has a type.
            let parsedCustomFields = customFields;
            if (typeof customFields === 'string') {
                try {
                    parsedCustomFields = JSON.parse(customFields);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid customFields format.  Expected an array of objects or a JSON string representing an array of objects.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedCustomFields)) {
                 return res.status(400).json({ message: "Invalid customFields format.  Expected an array of objects.", success: false });
            }

            // Add a default type if it's missing
            parsedCustomFields = parsedCustomFields.map(field => ({
                ...field,
                type: field.type || 'text' // Default type is text.
            }));
            let parsedTasks = tasks;
            if (typeof tasks === 'string') {
                try {
                    parsedTasks = JSON.parse(tasks);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid tasks format. Expected an array of objects or a JSON string representing an array.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedTasks)) {
                 return res.status(400).json({ message: "Invalid tasks format. Expected an array of objects.", success: false });
            }

            const jobData = {
                title,
                template,
                IncidentID,
                Teams,
                description,
                confidential,
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
                salary: salary,
                attachments: attachments,
                siteContact,  // Use the value from req.body
                SecondaryContact, // Use the value from req.body
                customFields: parsedCustomFields,
                tasks: parsedTasks,
            };

            const job = await Workorder.create(jobData);
            return res.status(201).json({ message: "New job created successfully", job, success: true });

        } catch (error) {
            console.error('Error creating job:', error);
            return res.status(500).json({ message: error.message, success: false, error: error.message });
        }
    });
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
        const timeSpent = checkoutTime - job.checkinTime;
        const timeInMinutes = timeSpent / (1000 * 60);

        let payableHours = 0;
        let payableSalary = 0;
        let rate = 0;

        if (job.jobType === 'part-time' && job.partTimeOptions) {
            const { base } = job.partTimeOptions;
            const { partTime } = job.salary || {};

            switch (base) {
                case 'hourly':
                    if (partTime.hourlyRate) {
                        rate = partTime.hourlyRate;
                        payableHours = Math.ceil(timeInMinutes / 60);
                        payableSalary = payableHours * rate;
                    } else if (partTime.fixedHourlyRate) {
                        payableSalary = partTime.fixedHourlyRate;
                    }
                    break;
                case 'daily':
                    if (partTime.dailyRate) {
                        rate = partTime.dailyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24));
                        payableSalary = payableHours * rate;
                    } else if (partTime.fixedDailyRate) {
                        payableSalary = partTime.fixedDailyRate;
                    }
                    break;
                case 'weekly':
                    if (partTime.weeklyRate) {
                        rate = partTime.weeklyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24 * 7));
                        payableSalary = payableHours * rate;
                    } else if (partTime.fixedWeeklyRate) {
                        payableSalary = partTime.fixedWeeklyRate;
                    }
                    break;
                case 'monthly':
                    if (partTime.monthlyRate) {
                        rate = partTime.monthlyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24 * 30));
                        payableSalary = payableHours * rate;
                    } else if (partTime.fixedMonthlyRate) {
                        payableSalary = partTime.fixedMonthlyRate;
                    }
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid part-time base', success: false });
            }
        } else if (job.jobType === 'full-time' && job.salary && job.salary.fullTime && job.salary.fullTime.contractRate) {
            // Full-time contract based job.
            payableSalary = job.salary.fullTime.contractRate;
        }

        const updatedJob = await Workorder.findByIdAndUpdate(
            id,
            { checkoutTime: checkoutTime, timeSpent: timeSpent, payableHours: payableHours, payableSalary: payableSalary },
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

        const doneJobs = jobs.filter(job => job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() && job.status === 'Done');

        const completedJobs = jobs.filter(job => job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() && job.status === 'Complete');

        res.status(200).json({
            appliedJobs,
            assignedJobs,
            inProgressJobs,
            doneJobs,
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