import mongoose from "mongoose";

// Temporary Company model for Admin Service
// TODO: Replace with Company Service client when Company Service is created
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    companyType: String,
    industry: String,
    description: String,
    contact: {
        email: String,
        phone: String,
        website: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        // No ref: 'User' - User belongs to Auth Service
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Company = mongoose.model("Company", companySchema);

export default Company;
