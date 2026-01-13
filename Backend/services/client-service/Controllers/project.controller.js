import { Project } from "../Models/project.model.js";
import { Client } from "../Models/client.model.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import mongoose from "mongoose";

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

    // Verify client exists (within this service)
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ 
        message: "Client not found", 
        success: false 
      });
    }

    const userId = req.user.userId || req.user._id;

    project = await Project.create({
      name: projectName,
      userId: userId,
      client: clientId,
    });

    // TODO: Send notification to assigned user when Notification Service is created
    // For now, we'll skip notification creation
    // if (assignedTo) {
    //   await createProjectAssignmentNotification(project._id, assignedTo);
    // }

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
      error: error.message,
    });
  }
};

export const getProject = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const projects = await Project.find({ userId });
        
        if (!projects || projects.length === 0) {
            return res.status(404).json({
                message: "Projects not found.",
                success: false,
            });
        }

        // Fetch client data for each project
        const projectsWithClients = await Promise.all(projects.map(async (project) => {
            const projectObj = project.toObject();
            if (project.client) {
                try {
                    const client = await Client.findById(project.client);
                    if (client) {
                        projectObj.client = client;
                    }
                } catch (error) {
                    console.error(`Error fetching client for project ${project._id}:`, error);
                }
            }
            return projectObj;
        }));

        return res.status(200).json({
            projects: projectsWithClients,
            success: true,
        });
    } catch (error) {
        console.error("Error getting projects:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false,
            error: error.message
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const projectId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid Project ID",
                success: false,
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found.",
                success: false,
            });
        }

        const projectObj = project.toObject();
        
        // Fetch client data
        if (project.client) {
            try {
                const client = await Client.findById(project.client);
                if (client) {
                    projectObj.client = client;
                }
            } catch (error) {
                console.error('Error fetching client:', error);
            }
        }

        return res.status(200).json({
            project: projectObj,
            success: true,
        });
    } catch (error) {
        console.error("Error getting project by ID:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false,
            error: error.message
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { name, description, website, location, client } = req.body;
        const file = req.file;

        let updateData = { name, description, website, location };
        
        if (client) {
            updateData.client = client;
        }

        if (file) {
            updateData.logo = await uploadToS3(file, 'projects');
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
            error: error.message
        });
    }
};

// Get projects by client ID
export const getProjectsByClientId = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({
                message: "Invalid Client ID",
                success: false,
            });
        }

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
            error: error.message
        });
    }
};
