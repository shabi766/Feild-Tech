import { Workorder } from "../Models/workorder.model.js";
import mongoose from 'mongoose';
import { multipleUpload } from "../middleware/multer.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import { getKafkaProducer } from '../../../shared-kafka/kafka-producer.js';
import { TOPICS } from '../../../shared-kafka/topics.js';
import { JobCreatedEvent, JobUpdatedEvent, JobCompletedEvent, JobCancelledEvent } from '../../../shared-kafka/events/job-events.js';

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

export const postJob = async (req, res) => {
    const uploadMiddleware = multipleUpload;

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
                siteContact,
                SecondaryContact,
                customFields,
                tasks,
                shipments,
                selectionRules,
                auditRules
            } = req.body;

            const userId = req.user.userId || req.user._id; // Support both token-only and full user object

            const errors = validateJobFields(req.body, status);
            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ message: "Please Fill All Feilds", errors, success: false });
            }

            // Find client and project using Client Service
            let client, project;
            try {
                const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
                const result = await ClientServiceClient.findClientAndProject(clientName, projectName, token);
                client = result.client;
                project = result.project;
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
                        const s3Url = await uploadToS3(file, 'attachments');
                        attachments.push({ name: file.originalname, url: s3Url });
                    } catch (uploadError) {
                        return res.status(500).json({ message: "Error uploading files to S3", success: false, error: uploadError.message });
                    }
                }
            }

            // Parse customFields
            let parsedCustomFields = customFields;
            if (typeof customFields === 'string') {
                try {
                    parsedCustomFields = JSON.parse(customFields);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid customFields format.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedCustomFields)) {
                return res.status(400).json({ message: "Invalid customFields format. Expected an array of objects.", success: false });
            }
            parsedCustomFields = parsedCustomFields.map(field => ({
                ...field,
                type: field.type || 'text'
            }));

            // Parse tasks
            let parsedTasks = tasks;
            if (typeof tasks === 'string') {
                try {
                    parsedTasks = JSON.parse(tasks);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid tasks format.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedTasks)) {
                return res.status(400).json({ message: "Invalid tasks format. Expected an array of objects.", success: false });
            }

            // Parse shipments
            let parsedShipments = shipments;
            if (typeof shipments === 'string') {
                try {
                    parsedShipments = JSON.parse(shipments);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid shipments format.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedShipments)) {
                return res.status(400).json({ message: "Invalid shipments format. Expected an array of objects.", success: false });
            }

            // Process shipment pictures
            const uploadedShipments = await Promise.all(parsedShipments.map(async (shipment, index) => {
                if (shipment.picture instanceof Object && shipment.picture.buffer) {
                    try {
                        const s3Url = await uploadToS3(shipment.picture, 'shipments');
                        return { ...shipment, picture: s3Url };
                    } catch (uploadError) {
                        console.error(`Error uploading shipment picture ${index + 1}:`, uploadError);
                        return { ...shipment, picture: null };
                    }
                }
                return shipment;
            }));

            // Parse selectionRules
            let parsedSelectionRules = selectionRules;
            if (typeof selectionRules === 'string') {
                try {
                    parsedSelectionRules = JSON.parse(selectionRules);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid selectionRules format.", success: false, error: e.message });
                }
            }
            if (typeof parsedSelectionRules !== 'object' || parsedSelectionRules === null) {
                return res.status(400).json({ message: "Invalid selectionRules format. Expected a JSON object.", success: false });
            }

            // Parse auditRules
            let parsedAuditRules = auditRules;
            if (typeof auditRules === 'string') {
                try {
                    parsedAuditRules = JSON.parse(auditRules);
                } catch (e) {
                    return res.status(400).json({ message: "Invalid auditRules format.", success: false, error: e.message });
                }
            }
            if (!Array.isArray(parsedAuditRules)) {
                return res.status(400).json({ message: "Invalid auditRules format. Expected an array of objects.", success: false });
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
                siteContact,
                SecondaryContact,
                customFields: parsedCustomFields,
                tasks: parsedTasks,
                shipments: uploadedShipments,
                selectionRules: parsedSelectionRules,
                auditRules: parsedAuditRules
            };

            const job = await Workorder.create(jobData);

            // Publish job.created event
            try {
                const producer = getKafkaProducer('workorder-service');
                const event = new JobCreatedEvent({
                    jobId: job._id.toString(),
                    title: job.title,
                    description: job.description,
                    createdBy: job.created_by.toString(),
                    location: `${job.location.city}, ${job.location.state}`,
                    budget: job.totalSalary,
                    category: job.skills?.[0] || 'General',
                    status: job.status
                }, {
                    source: 'workorder-service',
                    correlationId: req.headers['x-correlation-id'] || `job-${Date.now()}`
                });
                await producer.publishEvent(TOPICS.JOB_CREATED, event, job._id.toString());
                console.log('✅ Published job.created event for:', job._id);
            } catch (kafkaError) {
                console.error('⚠️ Failed to publish job.created event:', kafkaError);
            }

            return res.status(201).json({ message: "New job created successfully", job, success: true });

        } catch (error) {
            console.error('Error creating job:', error);
            return res.status(500).json({ message: error.message, success: false, error: error.message });
        }
    });
};

// Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Workorder.find(query).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        // Fetch client data for each job using Client Service
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const jobsWithClients = await Promise.all(jobs.map(async (job) => {
            const jobObj = job.toObject();
            if (job.clientName && token) {
                try {
                    const client = await ClientServiceClient.getClient(job.clientName, token);
                    jobObj.clientName = client;
                } catch (error) {
                    console.error(`Error fetching client for job ${job._id}:`, error);
                }
            }
            return jobObj;
        }));

        return res.status(200).json({
            jobs: jobsWithClients,
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

// Get job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false,
            });
        }

        const job = await Workorder.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const jobObj = job.toObject();

        // Fetch related data from other services
        const fetchPromises = [];

        if (job.clientName && token) {
            fetchPromises.push(
                ClientServiceClient.getClient(job.clientName, token)
                    .then(client => ({ type: 'clientName', data: client }))
                    .catch(err => {
                        console.error('Error fetching client:', err);
                        return { type: 'clientName', data: null };
                    })
            );
        }

        if (job.projectName && token) {
            fetchPromises.push(
                ClientServiceClient.getProject(job.projectName, token)
                    .then(project => ({ type: 'projectName', data: project }))
                    .catch(err => {
                        console.error('Error fetching project:', err);
                        return { type: 'projectName', data: null };
                    })
            );
        }

        if (job.assignedApplicant && token) {
            fetchPromises.push(
                AuthServiceClient.getUser(job.assignedApplicant, token)
                    .then(user => ({ type: 'assignedApplicant', data: user }))
                    .catch(err => {
                        console.error('Error fetching assigned applicant:', err);
                        return { type: 'assignedApplicant', data: null };
                    })
            );
        }

        if (job.created_by && token) {
            fetchPromises.push(
                AuthServiceClient.getUser(job.created_by, token)
                    .then(user => ({ type: 'created_by', data: user }))
                    .catch(err => {
                        console.error('Error fetching creator:', err);
                        return { type: 'created_by', data: null };
                    })
            );
        }

        const results = await Promise.all(fetchPromises);

        results.forEach(result => {
            if (result.data) {
                jobObj[result.type] = result.data;
            }
        });

        return res.status(200).json({ job: jobObj, success: true });
    } catch (error) {
        console.error("Error getting job by ID:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message,
        });
    }
};

// Get admin-created jobs
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.user.userId || req.user._id;
        const jobs = await Workorder.find({ created_by: adminId }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        // Fetch client data for each job using Client Service
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const jobsWithClients = await Promise.all(jobs.map(async (job) => {
            const jobObj = job.toObject();
            if (job.clientName && token) {
                try {
                    const client = await ClientServiceClient.getClient(job.clientName, token);
                    jobObj.clientName = client;
                } catch (error) {
                    console.error(`Error fetching client for job ${job._id}:`, error);
                }
            }
            return jobObj;
        }));

        return res.status(200).json({
            jobs: jobsWithClients,
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

// Update job
export const updateJob = async (req, res) => {
    const jobId = req.params.id;
    const updates = req.body;

    try {
        const updatedJob = await Workorder.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found', success: false });
        }

        // Publish job.updated event
        try {
            const producer = getKafkaProducer('workorder-service');
            const event = new JobUpdatedEvent({
                jobId: updatedJob._id.toString(),
                updatedFields: Object.keys(updates),
                status: updatedJob.status,
                updatedBy: req.user?.userId || req.user?._id
            }, { source: 'workorder-service' });
            await producer.publishEvent(TOPICS.JOB_UPDATED, event, updatedJob._id.toString());
        } catch (kafkaError) {
            console.error('⚠️ Failed to publish job.updated event:', kafkaError);
        }

        return res.status(200).json({ message: 'Job updated successfully', job: updatedJob, success: true });
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json({ message: 'Server error while updating job', success: false, error: error.message });
    }
};

// Update job status
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

// Checkin job
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

// Checkout job
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
                    if (partTime?.hourlyRate) {
                        rate = partTime.hourlyRate;
                        payableHours = Math.ceil(timeInMinutes / 60);
                        payableSalary = payableHours * rate;
                    } else if (partTime?.fixedHourlyRate) {
                        payableSalary = partTime.fixedHourlyRate;
                    }
                    break;
                case 'daily':
                    if (partTime?.dailyRate) {
                        rate = partTime.dailyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24));
                        payableSalary = payableHours * rate;
                    } else if (partTime?.fixedDailyRate) {
                        payableSalary = partTime.fixedDailyRate;
                    }
                    break;
                case 'weekly':
                    if (partTime?.weeklyRate) {
                        rate = partTime.weeklyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24 * 7));
                        payableSalary = payableHours * rate;
                    } else if (partTime?.fixedWeeklyRate) {
                        payableSalary = partTime.fixedWeeklyRate;
                    }
                    break;
                case 'monthly':
                    if (partTime?.monthlyRate) {
                        rate = partTime.monthlyRate;
                        payableHours = Math.ceil(timeInMinutes / (60 * 24 * 30));
                        payableSalary = payableHours * rate;
                    } else if (partTime?.fixedMonthlyRate) {
                        payableSalary = partTime.fixedMonthlyRate;
                    }
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid part-time base', success: false });
            }
        } else if (job.jobType === 'full-time' && job.salary && job.salary.fullTime && job.salary.fullTime.contractRate) {
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

// Mark job as done
export const doneJob = async (req, res) => {
    const { id } = req.params;
    const { notes, deliverables, images } = req.body;

    try {
        const job = await Workorder.findById(id);
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });

        const { completionRequirements } = job;
        const errors = [];

        if (completionRequirements.notesRequired && (!notes || notes.trim().length === 0)) {
            errors.push('Work order notes are required');
        }

        if (completionRequirements.imagesRequired && (!images || images.length === 0)) {
            errors.push('At least one image is required');
        }

        if (completionRequirements.deliverablesRequired && (!deliverables || deliverables.length === 0)) {
            errors.push('At least one deliverable is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Completion requirements not met',
                errors,
                success: false
            });
        }

        const updateData = {
            status: 'Done',
            doneTime: new Date(),
            workOrderNotes: notes || null,
            workOrderDeliverables: deliverables || [],
            workOrderImages: images || []
        };

        const updatedJob = await Workorder.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ message: 'Job marked done successfully', job: updatedJob, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

// Complete job
export const completeJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Complete', completeTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });

        // Publish job.completed event
        try {
            const producer = getKafkaProducer('workorder-service');
            const event = new JobCompletedEvent({
                jobId: job._id.toString(),
                technicianId: job.assignedApplicant?.toString(),
                clientId: job.created_by.toString(),
                completionDate: new Date().toISOString(),
                finalAmount: job.payableSalary || job.totalSalary
            }, { source: 'workorder-service' });
            await producer.publishEvent(TOPICS.JOB_COMPLETED, event, job._id.toString());
            console.log('✅ Published job.completed event for:', job._id);
        } catch (kafkaError) {
            console.error('⚠️ Failed to publish job.completed event:', kafkaError);
        }

        return res.status(200).json({ message: 'Job marked Complete successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

// Review job
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

// Cancel job
export const cancelJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Cancel', cancelledAt: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });

        // Publish job.cancelled event
        try {
            const producer = getKafkaProducer('workorder-service');
            const event = new JobCancelledEvent({
                jobId: job._id.toString(),
                reason: req.body.reason || 'Not specified',
                cancelledBy: req.user?.userId || req.user?._id,
                cancelledAt: new Date().toISOString()
            }, { source: 'workorder-service' });
            await producer.publishEvent(TOPICS.JOB_CANCELLED, event, job._id.toString());
        } catch (kafkaError) {
            console.error('⚠️ Failed to publish job.cancelled event:', kafkaError);
        }

        return res.status(200).json({ message: 'Job marked Cancel successfully', job, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

// Paid job
export const PaidJob = async (req, res) => {
    const { id } = req.params;
    try {
        const job = await Workorder.findByIdAndUpdate(id, { status: 'Paid', paidTime: new Date() }, { new: true });
        if (!job) return res.status(404).json({ message: 'Job not found', success: false });

        // TODO: Update technician performance stats via Review Service when it's created
        // For now, this functionality will remain in the main backend

        return res.status(200).json({
            message: 'Job marked Paid successfully. You can now review the technician.',
            job,
            success: true,
            canReview: true
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', success: false, error: error.message });
    }
};

// Get jobs by project
export const getJobsByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const jobs = await Workorder.find({ projectName: projectId });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ success: false, message: 'No jobs found for this project' });
        }

        // Fetch client and project data using Client Service
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const jobsWithData = await Promise.all(jobs.map(async (job) => {
            const jobObj = job.toObject();
            if (job.clientName && token) {
                try {
                    const client = await ClientServiceClient.getClient(job.clientName, token);
                    jobObj.clientName = client;
                } catch (error) {
                    console.error(`Error fetching client:`, error);
                }
            }
            if (job.projectName && token) {
                try {
                    const project = await ClientServiceClient.getProject(job.projectName, token);
                    jobObj.projectName = project;
                } catch (error) {
                    console.error(`Error fetching project:`, error);
                }
            }
            return jobObj;
        }));

        return res.status(200).json({ success: true, jobs: jobsWithData });
    } catch (error) {
        console.error('Error fetching jobs by project:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get technician jobs
export const getTechnicianJobs = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;

        // Fetch all jobs where user is applicant or assigned
        const jobs = await Workorder.find({
            $or: [
                { Application: { $elemMatch: { $eq: userId } } },
                { assignedApplicant: userId }
            ]
        });

        // Categorize jobs
        const appliedJobs = jobs.filter(job =>
            job.Application && job.Application.some(appId => appId.toString() === userId.toString()) &&
            (!job.assignedApplicant || job.assignedApplicant.toString() !== userId.toString())
        );

        const assignedJobs = jobs.filter(job =>
            job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() &&
            job.status === 'Assigned'
        );

        const inProgressJobs = jobs.filter(job =>
            job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() &&
            job.status === 'In Progress'
        );

        const doneJobs = jobs.filter(job =>
            job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() &&
            job.status === 'Done'
        );

        const completedJobs = jobs.filter(job =>
            job.assignedApplicant && job.assignedApplicant.toString() === userId.toString() &&
            job.status === 'Complete'
        );

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
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

// Get draft job by ID
export const getDraftJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false,
            });
        }

        const job = await Workorder.findById(jobId);

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
            });
        }

        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        const jobObj = job.toObject();

        // Fetch related data using Client Service
        if (job.clientName && token) {
            try {
                const client = await ClientServiceClient.getClient(job.clientName, token);
                jobObj.clientName = client;
            } catch (error) {
                console.error('Error fetching client:', error);
            }
        }

        if (job.projectName && token) {
            try {
                const project = await ClientServiceClient.getProject(job.projectName, token);
                jobObj.projectName = project;
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        }

        return res.status(200).json({ job: jobObj, success: true });
    } catch (error) {
        console.error("Error getting draft job by ID:", error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
            error: error.message,
        });
    }
};

// Upload work order images
export const uploadWorkOrderImages = async (req, res) => {
    const uploadMiddleware = multipleUpload;

    uploadMiddleware(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(400).json({ message: "Error uploading file(s)", success: false, error: err.message });
        }

        try {
            const { jobId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(jobId)) {
                return res.status(400).json({ message: "Invalid job ID", success: false });
            }

            const job = await Workorder.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: "Job not found", success: false });
            }

            let uploadedImages = [];
            if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        const s3Url = await uploadToS3(file, 'jobs');
                        uploadedImages.push(s3Url);
                    } catch (uploadError) {
                        return res.status(500).json({ message: "Error uploading files to S3", success: false, error: uploadError.message });
                    }
                }
            }

            const updatedJob = await Workorder.findByIdAndUpdate(
                jobId,
                { $push: { workOrderImages: { $each: uploadedImages } } },
                { new: true }
            );

            return res.status(200).json({
                message: "Images uploaded successfully",
                images: uploadedImages,
                job: updatedJob,
                success: true
            });

        } catch (error) {
            console.error('Error uploading work order images:', error);
            return res.status(500).json({ message: 'Server error', success: false, error: error.message });
        }
    });
};
