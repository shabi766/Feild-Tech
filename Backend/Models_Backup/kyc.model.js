import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Personal Information
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    cnicNumber: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: true,
        trim: true
    },
    
    // Financial Information
    occupation: {
        type: String,
        required: true,
        trim: true
    },
    employer: {
        type: String,
        required: true,
        trim: true
    },
    monthlyIncome: {
        type: String,
        required: true,
        trim: true
    },
    sourceOfFunds: {
        type: String,
        required: true,
        trim: true
    },
    purposeOfAccount: {
        type: String,
        required: true,
        trim: true
    },
    
    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        relationship: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        }
    },
    
    // Document Files
    documents: {
        cnicFront: {
            type: String, // File URL
            required: true
        },
        cnicBack: {
            type: String, // File URL
            required: true
        },
        selfie: {
            type: String, // File URL
            required: true
        },
        utilityBill: {
            type: String, // File URL
            required: true
        }
    },
    
    // KYC Status
    kycStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified'
    },
    
    // Admin Review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,
    
    // Verification Details
    verificationDate: Date,
    verificationMethod: {
        type: String,
        enum: ['manual', 'automated', 'third_party']
    },
    
    // Compliance
    complianceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    // Risk Assessment
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    
    // Metadata
    submittedAt: {
        type: Date,
        default: Date.now
    },
    
    // Expiry and Renewal
    expiryDate: Date,
    requiresRenewal: {
        type: Boolean,
        default: false
    },
    
    // Audit Trail
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updateHistory: [{
        field: String,
        oldValue: String,
        newValue: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
kycSchema.index({ userId: 1 });
kycSchema.index({ kycStatus: 1 });
kycSchema.index({ submittedAt: -1 });
kycSchema.index({ reviewedBy: 1 });
kycSchema.index({ expiryDate: 1 });

// Pre-save middleware to update lastUpdated
kycSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Method to update KYC status
kycSchema.methods.updateStatus = function(newStatus, adminId, notes = '') {
    this.kycStatus = newStatus;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    
    if (newStatus === 'verified') {
        this.verificationDate = new Date();
        this.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }
    
    return this.save();
};

// Method to add update history
kycSchema.methods.addUpdateHistory = function(field, oldValue, newValue, updatedBy) {
    this.updateHistory.push({
        field,
        oldValue: String(oldValue),
        newValue: String(newValue),
        updatedBy
    });
    
    return this.save();
};

// Static method to get KYC statistics
kycSchema.statics.getStatistics = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$kycStatus',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Static method to get pending KYC applications
kycSchema.statics.getPendingApplications = function(limit = 50) {
    return this.find({ kycStatus: 'pending' })
        .populate('userId', 'fullname email phoneNumber')
        .sort({ submittedAt: 1 })
        .limit(limit);
};

// Static method to get KYC by user
kycSchema.statics.getByUserId = function(userId) {
    return this.findOne({ userId }).populate('userId', 'fullname email phoneNumber');
};

export const KYC = mongoose.model("KYC", kycSchema);
