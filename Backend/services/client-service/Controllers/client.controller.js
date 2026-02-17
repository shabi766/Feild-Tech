import { Client } from "../Models/client.model.js";
import mongoose from "mongoose";
import { uploadToS3 } from "../utils/s3Upload.js";

export const registerClient = async (req, res) => {
    try {
        const { clientName, website, description, location } = req.body;
        const file = req.file;

        let logo = null;
        if (file) {
            logo = await uploadToS3(file, 'clients');
        }

        const userId = req.user.userId || req.user._id; // Support both token-only and full user object

        const client = await Client.create({
            name: clientName,
            website,
            description,
            location,
            logo,
            userId: userId,
        });

        if (client) {
            // TODO: Emit Socket.io event when Messaging Service is created
            // For now, we'll skip real-time notifications
            // const message = `${client.name} has been created!`;
            // io.emit('clientCreated', { message });

            return res.status(201).json({
                message: "Client registered successfully.",
                client,
                success: true,
            });
        } else {
            return res.status(500).json({
                message: "Client creation failed (unknown reason).",
                success: false,
            });
        }
    } catch (error) {
        console.error("Error registering client:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Client with this name already exists.",
                success: false,
                error: error.message,
            });
        }
        return res.status(500).json({
            message: "An error occurred while registering the client.",
            success: false,
            error: error.message,
        });
    }
};

export const getClient = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const clients = await Client.find({ userId });

        if (!clients || clients.length === 0) {
            return res.status(404).json({
                message: "Clients not found.",
                success: false,
            });
        }

        return res.status(200).json({
            clients,
            success: true,
        });
    } catch (error) {
        console.error("Error getting clients:", error);
        return res.status(500).json({
            message: "An error occurred while getting the clients.",
            success: false,
            error: error.message,
        });
    }
};

export const getClientById = async (req, res) => {
    const clientId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return res.status(400).json({
            message: "Invalid Client ID",
            success: false,
        });
    }

    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({
                message: "Client not found",
                success: false,
            });
        }

        res.status(200).json({
            client,
            success: true,
        });
    } catch (error) {
        console.error("Error getting client by ID:", error);
        res.status(500).json({
            message: "Server error",
            success: false,
            error: error.message,
        });
    }
};

export const updateClient = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;

        const updateData = { name, description, website, location };

        if (file) {
            updateData.logo = await uploadToS3(file, 'clients');
        }

        const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!client) {
            return res.status(404).json({
                message: "Client not found.",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Client information updated.",
            client,
            success: true,
        });
    } catch (error) {
        console.error("Error updating client:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Client with this name already exists.",
                success: false,
                error: error.message,
            });
        }
        return res.status(500).json({
            message: "An error occurred while updating the client.",
            success: false,
            error: error.message,
        });
    }
};
