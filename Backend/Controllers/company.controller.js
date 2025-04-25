import { Company } from "../Models/company.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false,
            });
        }

        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register the same company.",
                success: false,
            });
        }

        company = await Company.create({
            name: companyName,
            userId: req.user._id, // Use req.user._id (consistent)
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true,
        });
    } catch (error) {
        console.error("Error registering company:", error); // Log the error
        return res.status(500).json({
            message: "An error occurred while registering the company.",
            success: false,
            error: error.message, // Send the error message to the client
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.user._id; // Use req.user._id (consistent)
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false,
            });
        }
        return res.status(200).json({
            companies,
            success: true,
        });
    } catch (error) {
        console.error("Error getting companies:", error); // Log the error
        return res.status(500).json({
            message: "An error occurred while getting the companies.",
            success: false,
            error: error.message, // Send the error message to the client
        });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false,
            });
        }
        return res.status(200).json({
            company,
            success: true,
        });
    } catch (error) {
        console.error("Error getting company by ID:", error); // Log the error
        return res.status(500).json({
            message: "An error occurred while getting the company.",
            success: false,
            error: error.message, // Send the error message to the client
        });
    }
};

export const updateCompany = async (req, res) => {
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

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Company information updated.",
            success: true,
        });
    } catch (error) {
        console.error("Error updating company:", error); // Log the error
        return res.status(500).json({
            message: "An error occurred while updating the company.",
            success: false,
            error: error.message, // Send the error message to the client
        });
    }
};