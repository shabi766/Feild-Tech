import { KYC } from "../Models/kyc.model.js";
import { User } from "../Models/user.model.js";
import { uploadToS3 } from "../utils/s3Upload.js";

// Submit KYC application
export const submitKYC = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if user already has KYC
        const existingKYC = await KYC.findOne({ userId });
        if (existingKYC) {
            return res.status(400).json({
                success: false,
                message: "KYC application already exists for this user"
            });
        }

        // Extract form data
        const {
            fatherName,
            cnicNumber,
            dateOfBirth,
            address,
            city,
            postalCode,
            occupation,
            employer,
            monthlyIncome,
            sourceOfFunds,
            purposeOfAccount,
            emergencyContact
        } = req.body;

        // Validate required fields
        if (!fatherName || !cnicNumber || !dateOfBirth || !address || !city || !postalCode ||
            !occupation || !employer || !monthlyIncome || !sourceOfFunds || !purposeOfAccount) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Parse emergency contact
        let emergencyContactData;
        try {
            emergencyContactData = JSON.parse(emergencyContact);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency contact data"
            });
        }

        // Handle file uploads
        const documents = {};
        
        if (req.files?.cnicFront) {
            documents.cnicFront = await uploadToS3(req.files.cnicFront, 'kyc-documents');
        }
        
        if (req.files?.cnicBack) {
            documents.cnicBack = await uploadToS3(req.files.cnicBack, 'kyc-documents');
        }
        
        if (req.files?.selfie) {
            documents.selfie = await uploadToS3(req.files.selfie, 'kyc-documents');
        }
        
        if (req.files?.utilityBill) {
            documents.utilityBill = await uploadToS3(req.files.utilityBill, 'kyc-documents');
        }

        // Validate all documents are uploaded
        if (!documents.cnicFront || !documents.cnicBack || !documents.selfie || !documents.utilityBill) {
            return res.status(400).json({
                success: false,
                message: "All required documents must be uploaded"
            });
        }

        // Create KYC application
        const kyc = new KYC({
            userId,
            fatherName,
            cnicNumber,
            dateOfBirth: new Date(dateOfBirth),
            address,
            city,
            postalCode,
            occupation,
            employer,
            monthlyIncome,
            sourceOfFunds,
            purposeOfFunds: sourceOfFunds, // Alias for consistency
            purposeOfAccount,
            emergencyContact: emergencyContactData,
            documents,
            kycStatus: 'pending',
            submittedAt: new Date()
        });

        await kyc.save();

        res.status(201).json({
            success: true,
            message: "KYC application submitted successfully",
            kyc: {
                id: kyc._id,
                kycStatus: kyc.kycStatus,
                submittedAt: kyc.submittedAt
            }
        });

    } catch (error) {
        console.error("Error submitting KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get KYC status for current user
export const getKYCStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const kyc = await KYC.findOne({ userId }).populate('userId', 'fullname email phoneNumber');
        
        if (!kyc) {
            return res.status(200).json({
                success: true,
                kyc: null,
                user: req.user
            });
        }

        res.status(200).json({
            success: true,
            kyc: {
                id: kyc._id,
                kycStatus: kyc.kycStatus,
                submittedAt: kyc.submittedAt,
                reviewedAt: kyc.reviewedAt,
                reviewNotes: kyc.reviewNotes,
                rejectionReason: kyc.rejectionReason,
                expiryDate: kyc.expiryDate
            },
            user: req.user
        });

    } catch (error) {
        console.error("Error getting KYC status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get KYC details (for admin review)
export const getKYCDetails = async (req, res) => {
    try {
        const { kycId } = req.params;
        
        const kyc = await KYC.findById(kycId)
            .populate('userId', 'fullname email phoneNumber cnic')
            .populate('reviewedBy', 'fullname email');
        
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC application not found"
            });
        }

        res.status(200).json({
            success: true,
            kyc
        });

    } catch (error) {
        console.error("Error getting KYC details:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update KYC status (admin function)
export const updateKYCStatus = async (req, res) => {
    try {
        const { kycId } = req.params;
        const { status, notes, rejectionReason } = req.body;
        const adminId = req.user._id;
        
        // Validate status
        if (!['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'pending', 'verified', or 'rejected'"
            });
        }

        const kyc = await KYC.findById(kycId);
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC application not found"
            });
        }

        // Update status
        await kyc.updateStatus(status, adminId, notes);
        
        // Add rejection reason if status is rejected
        if (status === 'rejected' && rejectionReason) {
            kyc.rejectionReason = rejectionReason;
            await kyc.save();
        }

        // If verified, create wallet passcode for user
        if (status === 'verified') {
            // This will be handled by the wallet system
            // For now, we just update the status
        }

        res.status(200).json({
            success: true,
            message: `KYC status updated to ${status}`,
            kyc: {
                id: kyc._id,
                kycStatus: kyc.kycStatus,
                reviewedAt: kyc.reviewedAt,
                reviewNotes: kyc.reviewNotes
            }
        });

    } catch (error) {
        console.error("Error updating KYC status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all KYC applications (admin function)
export const getAllKYC = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status && ['unverified', 'pending', 'verified', 'rejected'].includes(status)) {
            query.kycStatus = status;
        }

        const skip = (page - 1) * limit;
        
        const [kycApplications, total] = await Promise.all([
            KYC.find(query)
                .populate('userId', 'fullname email phoneNumber')
                .populate('reviewedBy', 'fullname email')
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            KYC.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                kycApplications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error("Error getting all KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get KYC statistics (admin function)
export const getKYCStatistics = async (req, res) => {
    try {
        const stats = await KYC.getStatistics();
        
        // Format statistics
        const formattedStats = {
            unverified: 0,
            pending: 0,
            verified: 0,
            rejected: 0,
            total: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: formattedStats
        });

    } catch (error) {
        console.error("Error getting KYC statistics:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete KYC application (admin function)
export const deleteKYC = async (req, res) => {
    try {
        const { kycId } = req.params;
        
        const kyc = await KYC.findById(kycId);
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC application not found"
            });
        }

        // Only allow deletion of unverified or rejected applications
        if (kyc.kycStatus === 'verified' || kyc.kycStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete verified or pending KYC applications"
            });
        }

        await KYC.findByIdAndDelete(kycId);

        res.status(200).json({
            success: true,
            message: "KYC application deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting KYC:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
