import { Notification } from "../Models/notification.model.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";
import { WorkorderServiceClient } from "../Services/workorder-client.service.js";
import { ClientServiceClient } from "../Services/client-client.service.js";

// Helper function to create notifications
const createNotification = async (senderId, recipientId, type, relatedItemId, messageContent) => {
  try {
      const notification = new Notification({
          sender: senderId,
          recipient: recipientId,
          type,
          // Dynamically assign the correct related item field:
          ...(type === 'job_application' || type === 'job_created' || type === 'job_assigned' || type === 'job_assignment' ? { job: relatedItemId } : {}),
          ...(type === 'project_created' || type === 'project_assigned' ? { project: relatedItemId } : {}),
          ...(type === 'client_creation' ? { client: relatedItemId } : {}),
          message: messageContent,
      });

      const savedNotification = await notification.save();
      return savedNotification;
  } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
  }
};

// Controller to send notifications on job events
export const sendJobNotifications = async (req, res) => {
  try {
      const { jobId } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

      // Fetch job from Workorder Service
      const job = await WorkorderServiceClient.getJob(jobId, token);

      if (!job) {
          return res.status(404).json({ message: "Job not found", success: false });
      }

      const senderId = req.user.userId || req.user._id;

      const notification = await createNotification(
          senderId,
          job.created_by,
          "job_application",
          jobId,
          `A technician applied for job: ${job.title}`
      );

      return res.status(201).json({ message: "Application notification sent", success: true, notification });
  } catch (error) {
      console.error("Error in sendJobNotifications:", error);
      return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

export const sendJobCreatedNotification = async (req, res) => {
  try {
    const { message, jobId } = req.body;
    const adminUserId = req.user.userId || req.user._id;

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const senderId = req.user.userId || req.user._id;

    const newNotification = new Notification({
      sender: senderId,
      recipient: adminUserId,
      type: 'job_created',
      job: jobId || null,
      message: message || 'A new job has been created',
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Job created notification sent", notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};

export const sendProjectCreatedNotification = async (req, res) => {
  try {
    const { message, projectId } = req.body;
    const adminUserId = req.user.userId || req.user._id;

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const senderId = req.user.userId || req.user._id;

    const newNotification = new Notification({
      sender: senderId,
      recipient: adminUserId,
      type: 'project_created',
      project: projectId || null,
      message: message || 'A new project has been created',
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Project created notification sent", notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};

// Controller to get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID is missing.", success: false }); 
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ timestamp: -1 });

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({ notifications: [], success: true });
    }

    // Fetch related data from other services
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
    const notificationsWithData = await Promise.all(notifications.map(async (notification) => {
      const notifObj = notification.toObject();
      
      // Fetch sender data
      if (notification.sender && token) {
        try {
          const sender = await AuthServiceClient.getUser(notification.sender, token);
          notifObj.sender = sender;
        } catch (error) {
          console.error(`Error fetching sender for notification ${notification._id}:`, error);
        }
      }

      // Fetch job data if applicable
      if (notification.job && token) {
        try {
          const job = await WorkorderServiceClient.getJob(notification.job, token);
          notifObj.job = job;
        } catch (error) {
          console.error(`Error fetching job for notification ${notification._id}:`, error);
        }
      }

      // Fetch project data if applicable
      if (notification.project && token) {
        try {
          const project = await ClientServiceClient.getProject(notification.project, token);
          notifObj.project = project;
        } catch (error) {
          console.error(`Error fetching project for notification ${notification._id}:`, error);
        }
      }

      // Fetch client data if applicable
      if (notification.client && token) {
        try {
          const client = await ClientServiceClient.getClient(notification.client, token);
          notifObj.client = client;
        } catch (error) {
          console.error(`Error fetching client for notification ${notification._id}:`, error);
        }
      }

      return notifObj;
    }));

    return res.status(200).json({ notifications: notificationsWithData, success: true });
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message }); 
  }
};

// Controller to mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId || req.user._id;

    // Verify the notification belongs to the user
    const notification = await Notification.findOne({ 
      _id: notificationId, 
      recipient: userId 
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found", success: false });
    }

    notification.status = 'read';
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read", success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// Controller to clear all notifications for a user
export const clearUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    await Notification.deleteMany({ recipient: userId });

    return res.status(200).json({ message: "All notifications cleared", success: true });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message }); 
  }
};

export const sendClientCreationNotification = async (req, res) => {
  try {
    const { message, clientId } = req.body;
    const adminUserId = req.user.userId || req.user._id;

    if (!adminUserId) {
      return res.status(400).json({ success: false, message: "Admin userId is required" });
    }

    const senderId = req.user.userId || req.user._id;

    const newNotification = new Notification({
      sender: senderId,
      recipient: adminUserId,
      type: 'client_creation',
      client: clientId || null,
      message: message || 'A new client has been created',
    });

    await newNotification.save();

    res.status(200).json({ success: true, message: "Client creation notification sent", notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Error creating notification", error: error.message });
  }
};

export const sendJobAssignedNotification = async (req, res) => {
  try {
      const { jobId, applicantIds } = req.body; // applicantIds is an array of user IDs
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

      if (!jobId || !applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
          return res.status(400).json({ 
              message: "Job ID and applicant IDs are required", 
              success: false 
          });
      }

      // Fetch job from Workorder Service
      const job = await WorkorderServiceClient.getJob(jobId, token);

      if (!job) {
          return res.status(404).json({ message: "Job not found", success: false });
      }

      const senderId = req.user.userId || req.user._id;
      const notificationMessage = `You have been assigned to the job: ${job.title}`;

      // Create notifications for all applicants
      const notifications = [];
      for (const applicantId of applicantIds) {
          try {
              const notification = await createNotification(
                  senderId,
                  applicantId,
                  "job_assignment",
                  jobId,
                  notificationMessage
              );
              notifications.push(notification);
          } catch (notificationError) {
              console.error(`Error sending notification to ${applicantId}:`, notificationError);
          }
      }

      return res.status(200).json({ 
          message: "Job assigned notifications sent", 
          success: true,
          notifications 
      });
  } catch (error) {
      console.error("Error in sendJobAssignedNotification:", error);
      return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};
