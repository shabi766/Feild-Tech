import { Client } from "../Models/client.model.js";
import mongoose from "mongoose";
import { io } from "../index.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const registerClient = async (req, res) => {
    try {
        const { clientName, website, description, location } = req.body;
        const file = req.file;

        let logo = null;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        const client = await Client.create({
            name: clientName,
            website,
            description,
            location,
            logo,
            userId: req.user._id, // Use req.user._id (consistent)
        });

        if (client) {
            const message = `${client.name} has been created!`;
            io.emit('clientCreated', { message });

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
        console.error("Error registering client:", error); // Log the full error
        return res.status(500).json({
            message: "An error occurred while registering the client.",
            success: false,
            error: error.message, // Send error message to the client
        });
    }
};

export const getClient = async (req, res) => {
    try {
        const userId = req.user._id; // Use req.user._id (consistent)
        const clients = await Client.find({ userId });
        if (!clients) {
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
        console.error("Error getting clients:", error); // Log the error
        return res.status(500).json({
            message: "An error occurred while getting the clients.",
            success: false,
            error: error.message, // Send error message to the client
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
        console.error("Error getting client by ID:", error); // Log the error
        res.status(500).json({
            message: "Server error",
            success: false,
            error: error.message, // Send error message to the client
        });
    }
};

export const updateClient = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const file = req.file;

        let logo = null;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        const updateData = { name, description, website, location, logo };

        const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!client) {
            return res.status(404).json({
                message: "Client not found.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Client information updated.",
            success: true,
        });
    } catch (error) {
        console.error("Error updating client:", error); // Log the error
        res.status(500).json({
            message: "An error occurred while updating the client.",
            success: false,
            error: error.message, // Send error message to the client
        });
    }
};