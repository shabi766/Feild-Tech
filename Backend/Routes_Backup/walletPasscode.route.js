import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import {
    createWalletPasscode,
    verifyWalletPasscode,
    changeWalletPasscode,
    resetWalletPasscode,
    unlockWallet,
    getWalletPasscodeStatus,
    getLockedWallets,
    deleteWalletPasscode
} from "../Controllers/walletPasscode.controller.js";

const router = express.Router();

// User routes (require authentication)
router.post("/create", isAuthenticated, createWalletPasscode);
router.post("/verify", isAuthenticated, verifyWalletPasscode);
router.put("/change", isAuthenticated, changeWalletPasscode);
router.get("/status", isAuthenticated, getWalletPasscodeStatus);

// Admin routes (require admin authentication)
router.put("/admin/:userId/reset", isAuthenticated, isAdmin, resetWalletPasscode);
router.put("/admin/:userId/unlock", isAuthenticated, isAdmin, unlockWallet);
router.get("/admin/locked", isAuthenticated, isAdmin, getLockedWallets);
router.delete("/admin/:userId", isAuthenticated, isAdmin, deleteWalletPasscode);

export default router;
