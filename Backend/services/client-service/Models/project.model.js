import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String 
    },
    website: { 
        type: String 
    },
    location: { 
        type: String 
    },
    logo: { 
        type: String  // URL to project logo
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        // No ref: 'User' - User belongs to Auth Service
        required: true 
    },
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        // No ref: 'Client' - Client belongs to this service, but we don't use populate
        required: true 
    }
}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);
