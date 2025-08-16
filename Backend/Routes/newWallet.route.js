import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isCompanyManager from "../middleware/isCompanyManager.js";
import {
    createUserWallet,
    createCompanyWallet,
    createSubWallet,
    getWalletOverview,
    topUpWallet,
    transferFunds,
    payTechnician,
    getTransactionHistory
} from "../Controllers/newWallet.controller.js";

const router = express.Router();

// Wallet creation routes
router.post("/user-wallet", isAuthenticated, createUserWallet);
router.post("/company-wallet/:companyId", isAuthenticated, isCompanyManager, createCompanyWallet);
router.post("/sub-wallet/:companyId/:employeeId", isAuthenticated, isCompanyManager, createSubWallet);

// Wallet operations
router.get("/overview", isAuthenticated, getWalletOverview);
router.post("/topup", isAuthenticated, topUpWallet);
router.post("/transfer", isAuthenticated, transferFunds);
router.post("/pay-technician", isAuthenticated, payTechnician);

// Transaction history
router.get("/transactions", isAuthenticated, getTransactionHistory);

export default router;
