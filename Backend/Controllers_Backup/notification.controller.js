import { Notification } from "../Models/notification.model.js";
import { Application } from "../Models/application.model.js";
import { Workorder } from "../Models/workorder.model.js";
import { User } from "../Models/user.model.js";
import { Project } from "../Models/project.model.js"; 

const createNotification = async (senderId, recipientId, type, relatedItemId, messageContent) => { // relatedItemId parameter is added
  try {
      const notification = new Notification({
          sender: senderId,
          recipient: recipientId,
          type,
          // Dynamically assign the correct related item field:
          ...(type === 'job_application' || type === 'job_created' ? { job: relatedItemId } : {}),
          ...(type === 'project_created' ? { project: relatedItemId } : {}),
          ...(type === 'client_creation' ? { client: relatedItemId } : {}),
          message: messageContent,
      });

      const savedNotification = await notification.save(); // Save and return the saved object
      return savedNotification;
  } catch (error) {
      console.error("Error creating notification:", error);
      throw error; // Re-throw for error handling in controllers
  }
};


// Controller to send notifications on job events
export const sendJobNotifications = async (req, res) => {
  try {
      const { jobId } = req.body; // Make sure jobId is being sent from the frontend
      const job = await Workorder.findById(jobId);

      if (!job) {
          return res.status(404).json({ message: "Job not found", success: false });
      }

      const notification = await createNotification(
          req.user._id,
          job.created_by,
          "job_application",
          jobId, // Pass jobId as relatedItemId
          `${req.user.fullname} applied for job: ${job.title}`
      );

      return res.status(201).json({ message: "Application notification sent", success: true, notification }); // Include notification in the response
  } catch (error) {
      console.error("Error in sendJobNotifications:", error);
      return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};


export const sendJobCreatedNotification = async (req, res) => {
  try {
    const { message } = req.body;

    const adminUserId = req.user._id; 

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const newNotification = new Notification({
      sender: req.user._id, 
      recipient: adminUserId, 
      type: 'job_created',
      message: message,
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Job created" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};

export const sendProjectCreatedNotification = async (req, res) => {
  try {
    const { message } = req.body;

    const adminUserId = req.user._id; 

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const newNotification = new Notification({
      sender: req.user._id, 
      recipient: adminUserId, 
      type: 'project_created',
      message: message,
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Notification created" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};

// ... (Rest of your controllers: getUserNotifications, markNotificationAsRead, clearUserNotifications, sendClientCreationNotification)

// Controller to get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have authentication middleware that sets req.user

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID is missing.", success: false }); 
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ timestamp: -1 })
      .populate('sender', 'fullname')
      .populate('job')
      .populate('sender')
      .populate('recipient');

    return res.status(200).json({ notifications, success: true });
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message }); 
  }
};

// Controller to mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId },
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found", success: false });
    }

    return res.status(200).json({ message: "Notification marked as read", success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// Controller to clear all notifications for a user
export const clearUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; 

    await Notification.deleteMany({ recipient: userId });

    return res.status(200).json({ message: "All notifications cleared", success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message }); 
  }
};

export const sendClientCreationNotification = async (req, res) => {
  try {
    const { message } = req.body;

    const adminUserId = req.user._id; 

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const newNotification = new Notification({
      sender: req.user._id, 
      recipient: adminUserId, 
      type: 'client_creation',
      message: message,
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Notification created" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};
export const sendJobAssignedNotification = async (req, res) => {
  try {
      const { jobId } = req.body;

      const job = await Workorder.findById(jobId)
          .populate({
              path: 'Application', // Populate the applications array
              populate: {  // Nested populate for applicant
                  path: 'applicant',
                  model: 'User' // Important to include the model name
              }
          });

      if (!job) {
          return res.status(404).json({ message: "Job not found", success: false });
      }

      if (!job.Application || job.Application.length === 0) { // Correct property name
          return res.status(404).json({ message: "No applications found for this job", success: false });
      }

      for (const application of job.Application) { // Correct property name
          const applicant = application.applicant;

          if (!applicant) {
              console.error("Applicant not found for application:", application._id);
              continue;
          }

          const notificationMessage = `You have been assigned to the job: ${job.title}`;

          try {
              await createNotification(
                  req.user._id,
                  applicant._id,
                  "job_assignment",
                  jobId, // Or application._id if you want to link to the application
                  notificationMessage
              );
              console.log(`Notification sent to ${applicant.fullname} for job ${job.title}`);
          } catch (notificationError) {
              console.error(`Error sending notification to ${applicant.fullname}:`, notificationError);
          }
      }

      return res.status(200).json({ message: "Job assigned notifications sent", success: true });
  } catch (error) {
      console.error("Error in sendJobAssignedNotification:", error);
      return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};



