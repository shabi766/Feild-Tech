import { Project } from "../Models/project.model.js";
import { Client } from "../Models/client.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import { Notification } from "../Models/notification.model.js";

// Register Project Controller
export const registerProject = async (req, res) => {
  try {
    const { projectName, clientId, assignedTo } = req.body;

    if (!projectName || !clientId) {
      return res.status(400).json({
        message: "Project name and client ID are required.",
        success: false,
      });
    }

    let project = await Project.findOne({ name: projectName });
    if (project) {
      return res.status(400).json({
        message: "A project with that name already exists.",
        success: false,
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found", success: false });
    }

    project = await Project.create({
      name: projectName,
      userId: req.user._id, // Use req.user._id for logged-in user
      client: clientId,
    });

    // Send notification to assigned user (if any)
    if (assignedTo) {
      await createProjectAssignmentNotification(project._id, assignedTo);
    }

    res.status(201).json({
      message: "Project registered successfully.",
      project,
      success: true,
    });
  } catch (error) {
    console.error("Error registering project:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message, // Send the error message to the client (for debugging)
    });
  }
};

// Helper function to create project assignment notification
const createProjectAssignmentNotification = async (projectId, assignedTo) => {
  try {
    const notification = new Notification({
      sender: null, // Project creation notification, no specific sender
      recipient: assignedTo,
      type: "project_assigned",
      job: null, // Not applicable for projects
      message: `You have been assigned to project: ${projectId}`,
    });

    await notification.save();
  } catch (error) {
    console.error("Error creating project assignment notification:", error);
  }
};
export const getProject = async (req, res) => {
    try {
        const userId = req.user._id; // Use req.user._id (consistent)
        const projects = await Project.find({ userId }).populate('client');
        if (!projects || projects.length === 0) { // Check for both null and empty array
            return res.status(404).json({
                message: "Projects not found.",
                success: false,
            });
        }
        return res.status(200).json({
            projects,
            success: true,
        });
    } catch (error) {
        console.error("Error getting projects:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false,
            error: error.message // Send the error message to the client
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found.",
                success: false,
            });
        }
        return res.status(200).json({
            project,
            success: true,
        });
    } catch (error) {
        console.error("Error getting project by ID:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false,
            error: error.message // Send the error message to the client
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { name, description, website, location, client } = req.body;
        const file = req.file;

        let updateData = { name, description, website, location, client };

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            updateData.logo = cloudResponse.secure_url;
        }

        const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!project) {
            return res.status(404).json({
                message: "Project not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Project updated successfully.",
            project,
            success: true,
        });
    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ 
            message: "Internal server error.", 
            success: false,
            error: error.message // Send the error message to the client
        });
    }
};

// Get projects by client ID
export const getProjectsByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;

        const projects = await Project.find({ client: clientId });
        if (!projects || projects.length === 0) {
            return res.status(404).json({
                message: "No projects found for this client.",
                success: false,
            });
        }

        return res.status(200).json({
            projects,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching projects by client ID:", error);
        return res.status(500).json({
            message: "An error occurred while fetching projects.",
            success: false,
            error: error.message // Send the error message to the client
        });
    }
};