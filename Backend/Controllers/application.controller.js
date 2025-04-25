import { Application } from "../Models/application.model.js"
import { Workorder } from "../Models/workorder.model.js";
import mongoose from "mongoose";

export const applyJob = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({ message: "Job id is required.", success: false });
        }

        const job = await Workorder.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        const { startTime, endTime } = job; // Destructure startTime and endTime from the job.

        const existingApplication = await Application.findOne({ Workorder: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job.", success: false });
        }

        // Check for overlapping applications (using startTime and endTime from the job).
        const overlappingApplications = await Application.find({
            applicant: userId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (overlappingApplications.length > 0) {
            return res.status(400).json({ message: "This job overlaps with another assignment.", success: false });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newApplication = new Application({
                Workorder: jobId,
                applicant: userId,
                startTime: new Date(),  // Current time.
                endTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours from now.
                status: 'pending' // Initial status
            });

            const savedApplication = await newApplication.save({ session }); // Save the application first

            const updatedJob = await Workorder.findByIdAndUpdate(
                jobId,
                { $addToSet: { Application: savedApplication._id } }, // Use $addToSet
                { new: true, session }// Important: Pass the session here as well
            ).populate('Application'); // Populate applications after update

            if (!updatedJob) {
                await session.abortTransaction();
                return res.status(500).json({ message: "Job update failed. Job not found.", success: false });
            }

            await session.commitTransaction();

            return res.status(201).json({ 
                message: "Job applied successfully.", 
                success: true, 
                application: savedApplication, // Send back the saved application
                job: updatedJob // Send back the updated job document
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


export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.user._id;

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'Workorder', // Populate job details
                populate: { path: 'created_by', select: 'fullname email' } // Populate job creator details
            });

        if (!applications || applications.length === 0) {
            return res.status(404).json({
                message: "No applied jobs found.",
                success: false
            });
        }

        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
    }
};

// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Workorder.findById(jobId).populate({
            path: 'Application',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant', // No change needed here, as you're populating applicant
            },
        

        });
        if(!job){
            return res.status(404).json({
                message:'Job not found.',
                success:false
            })
        };
        return res.status(200).json({
            job, 
            success:true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message }); // Include error message
    }
}
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({ message: "Status is required", success: false });
        }

        const application = await Application.findById(applicationId)
            .populate("Workorder")
            .populate('applicant'); // Populate applicant

        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        application.status = status.toLowerCase();
        await application.save();

        if (status.toLowerCase() === "assigned") {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const job = await Workorder.findByIdAndUpdate(
                    application.Workorder._id,
                    {
                        status: "Assigned",
                        assignedApplicant: application.applicant._id, // Correct: Use applicant._id
                    },
                    { new: true, session }
                ).populate("assignedApplicant"); // Populate assignedApplicant

                if (!job) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: "Job not found.", success: false });
                }

                await session.commitTransaction();
                session.endSession();

                return res.status(200).json({
                    message: "Status updated successfully. Job assigned.",
                    success: true,
                    application,
                    job,
                });
            } catch (jobUpdateError) {
                await session.abortTransaction();
                session.endSession();
                console.error("Error updating job:", jobUpdateError);
                return res.status(500).json({
                    message: "Error updating job (transaction failed).",
                    success: false,
                    error: jobUpdateError.message,
                });
            }
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true,
            application,
        });

    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message,
        });
    }
};
export const getApplicationsForCalendar = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('Workorder') // Use 'Workorder' (uppercase W)
            .populate('applicant');
        return res.status(200).json({ application: applications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}