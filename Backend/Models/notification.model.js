import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "job_application",
      "job_assigned",
      "job_created",
      "project_assigned",
      "project_created",
      "job_assignment",

      "client_creation", // Add 'client_creation' for client notification
    ],
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workorder", // Assuming Workorder model for jobs
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model("Notification", NotificationSchema);