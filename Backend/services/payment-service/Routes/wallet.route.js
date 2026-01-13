import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  getWalletOverview,
  submitKYC,
  getKYC,
  topupWallet,
  withdrawToBank
} from "../Controllers/wallet.controller.js";
import { multipleUpload } from "../middleware/multer.js";

const router = express.Router();

// Wallet overview
router.get("/overview", isAuthenticated, getWalletOverview);

// KYC endpoints
router.get("/kyc", isAuthenticated, getKYC);
router.post("/kyc", isAuthenticated, multipleUpload, submitKYC);

// Wallet operations
router.post("/topup", isAuthenticated, topupWallet);
router.post("/withdraw", isAuthenticated, withdrawToBank);

export default router;
