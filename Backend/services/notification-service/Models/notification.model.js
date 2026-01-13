import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref: "User" - User belongs to Auth Service
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref: "User" - User belongs to Auth Service
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
      "client_creation",
    ],
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref: "Workorder" - Workorder belongs to Workorder Service
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref: "Project" - Project belongs to Client Service
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref: "Client" - Client belongs to Client Service
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
