import mongoose from "mongoose";
import { Application } from "../Models/application.model.js";
import { WorkorderServiceClient } from "../Services/workorder-client.service.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";

/**
 * Apply for a job/workorder
 */
export const applyJob = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const jobId = req.params.id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (!jobId) {
            return res.status(400).json({ message: "Job id is required.", success: false });
        }

        // Fetch job from Workorder Service
        const job = await WorkorderServiceClient.getWorkorder(jobId, token);
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({ Workorder: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job.", success: false });
        }

        // Check for overlapping applications
        const { startTime, endTime } = job;
        if (startTime && endTime) {
            const overlappingApplications = await Application.find({
                applicant: userId,
                $or: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
                ]
            });

            if (overlappingApplications.length > 0) {
                return res.status(400).json({ message: "This job overlaps with another assignment.", success: false });
            }
        }

        // Create application
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newApplication = new Application({
                Workorder: jobId,
                applicant: userId,
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
                status: 'pending'
            });

            const savedApplication = await newApplication.save({ session });

            // Update workorder to include application (via Workorder Service)
            // Note: This might need to be handled differently depending on Workorder Service implementation
            // For now, we'll just return success

            await session.commitTransaction();

            return res.status(201).json({ 
                message: "Job applied successfully.", 
                success: true, 
                application: savedApplication
            });

        } catch (innerError) {
            await session.abortTransaction();
            console.error("Error in applyJob (inner):", innerError);
            return res.status(500).json({ 
                message: "Internal server error", 
                success: false, 
                error: innerError.message 
            });
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error("Error in applyJob (outer):", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false, 
            error: error.message 
        });
    }
};

/**
 * Get all jobs applied by the current user
 */
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 });

        // Enrich with workorder and user data
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                try {
                    const workorder = await WorkorderServiceClient.getWorkorder(app.Workorder, token);
                    const user = await AuthServiceClient.getUser(app.applicant, token);
                    
                    return {
                        ...app.toObject(),
                        workorder: workorder || null,
                        applicant: user || null
                    };
                } catch (error) {
                    console.error('Error enriching application:', error);
                    return app.toObject();
                }
            })
        );

        if (!enrichedApplications || enrichedApplications.length === 0) {
            return res.status(404).json({
                message: "No applied jobs found.",
                success: false
            });
        }

        return res.status(200).json({
            applications: enrichedApplications,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
    }
};

/**
 * Get all applicants for a job (admin/recruiter view)
 */
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        // Verify job exists
        const job = await WorkorderServiceClient.getWorkorder(jobId, token);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        // Get all applications for this job
        const applications = await Application.find({ Workorder: jobId })
            .sort({ createdAt: -1 });

        // Enrich with applicant data
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                try {
                    const applicant = await AuthServiceClient.getUser(app.applicant, token);
                    return {
                        ...app.toObject(),
                        applicant: applicant || null
                    };
                } catch (error) {
                    console.error('Error enriching applicant:', error);
                    return app.toObject();
                }
            })
        );

        return res.status(200).json({
            job: {
                ...job,
                applications: enrichedApplications
            },
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
    }
};

/**
 * Update application status
 */
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (!status) {
            return res.status(400).json({ message: "Status is required", success: false });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        application.status = status.toLowerCase();
        await application.save();

        // If status is "assigned", update workorder status
        if (status.toLowerCase() === "assigned") {
            try {
                await WorkorderServiceClient.updateWorkorderStatus(
                    application.Workorder,
                    "Assigned",
                    application.applicant,
                    token
                );
            } catch (workorderError) {
                console.error("Error updating workorder:", workorderError);
                // Don't fail the request, just log the error
            }
        }

        // Enrich with related data
        let enrichedApplication = application.toObject();
        try {
            const workorder = await WorkorderServiceClient.getWorkorder(application.Workorder, token);
            const applicant = await AuthServiceClient.getUser(application.applicant, token);
            enrichedApplication.workorder = workorder;
            enrichedApplication.applicant = applicant;
        } catch (error) {
            console.error('Error enriching application:', error);
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true,
            application: enrichedApplication
        });

    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

/**
 * Get applications for calendar view
 */
export const getApplicationsForCalendar = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
        
        const applications = await Application.find()
            .sort({ createdAt: -1 });

        // Enrich with workorder and applicant data
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                try {
                    const workorder = await WorkorderServiceClient.getWorkorder(app.Workorder, token);
                    const applicant = await AuthServiceClient.getUser(app.applicant, token);
                    
                    return {
                        ...app.toObject(),
                        workorder: workorder || null,
                        applicant: applicant || null
                    };
                } catch (error) {
                    console.error('Error enriching application:', error);
                    return app.toObject();
                }
            })
        );

        return res.status(200).json({ 
            applications: enrichedApplications,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
    }
};
