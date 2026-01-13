import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    sendJobNotifications,
    getUserNotifications,
    markNotificationAsRead,
    clearUserNotifications,
    sendClientCreationNotification,
    sendProjectCreatedNotification,
    sendJobCreatedNotification,
    sendJobAssignedNotification
} from "../Controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for authenticated user
router.route("/").get(isAuthenticated, getUserNotifications);

// Mark notification as read
router.route("/:id/read").patch(isAuthenticated, markNotificationAsRead);

// Clear all notifications for user
router.route("/clear").delete(isAuthenticated, clearUserNotifications);

// Send specific notifications
router.route("/client-create").post(isAuthenticated, sendClientCreationNotification);
router.route("/Project-create").post(isAuthenticated, sendProjectCreatedNotification);
router.route("/Job-create").post(isAuthenticated, sendJobCreatedNotification);
router.route("/send").post(isAuthenticated, sendJobNotifications);
router.route("/job-assigned").post(isAuthenticated, sendJobAssignedNotification);

export default router;
