import mongoose from "mongoose";

const companyAddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true }
}, { _id: false });

const companyContactSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    website: { type: String }
}, { _id: false });

const companyRecruiterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    position: { type: String },
    isPrimary: { type: Boolean, default: true }
}, { _id: false });

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    companyType: {
        type: String,
        required: true,
        enum: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Construction', 'Education', 'Consulting', 'Real Estate', 'Other']
    },
    industry: {
        type: String,
        required: true,
        enum: ['Software Development', 'IT Services', 'Healthcare Services', 'Financial Services', 'Manufacturing', 'E-commerce', 'Construction', 'Education', 'Consulting', 'Real Estate', 'Marketing', 'Legal Services', 'Other']
    },
    description: {
        type: String,
        maxlength: 1000
    },
    contact: {
        type: companyContactSchema,
        required: true
    },
    address: {
        type: companyAddressSchema,
        required: true
    },
    foundedYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    employeeCount: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    annualRevenue: {
        type: String,
        enum: ['Under $100K', '$100K - $500K', '$500K - $1M', '$1M - $5M', '$5M - $10M', '$10M+']
    },
    recruiters: [companyRecruiterSchema],
    businessLicense: { type: String },
    taxId: { type: String },
    companyRegistration: { type: String },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'verified'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: { type: Date },
    logo: { type: String },
    brandColors: {
        primary: { type: String },
        secondary: { type: String }
    },
    settings: {
        allowPublicProfile: { type: Boolean, default: true },
        requireApprovalForJobs: { type: Boolean, default: false },
        autoApproveTechnicians: { type: Boolean, default: false }
    },
    stats: {
        totalJobsPosted: { type: Number, default: 0 },
        totalTechniciansHired: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 }
    }
}, { timestamps: true });

companySchema.index({ status: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ 'address.city': 1, 'address.country': 1 });

companySchema.virtual('companyAge').get(function() {
    if (this.foundedYear) {
        return new Date().getFullYear() - this.foundedYear;
    }
    return null;
});

companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

export const Company = mongoose.model("Company", companySchema);
