import express from "express";
import multer from "multer";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import {
    submitKYC,
    getKYCStatus,
    getKYCDetails,
    updateKYCStatus,
    getAllKYC,
    getKYCStatistics,
    deleteKYC
} from "../Controllers/kyc.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
    }
});

// User routes (require authentication)
router.post("/submit", isAuthenticated, upload.fields([
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'utilityBill', maxCount: 1 }
]), submitKYC);

router.get("/status", isAuthenticated, getKYCStatus);

// Admin routes (require admin authentication)
router.get("/admin/all", isAuthenticated, isAdmin, getAllKYC);
router.get("/admin/statistics", isAuthenticated, isAdmin, getKYCStatistics);
router.get("/admin/:kycId", isAuthenticated, isAdmin, getKYCDetails);
router.put("/admin/:kycId/status", isAuthenticated, isAdmin, updateKYCStatus);
router.delete("/admin/:kycId", isAuthenticated, isAdmin, deleteKYC);

export default router;
