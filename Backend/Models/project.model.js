// Project Model (project.model.js)
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    website: { type: String },
    location: { type: String },
    logo: { type: String },  // URL to project logo
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }  // Reference to Client
}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);
