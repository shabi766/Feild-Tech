import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  getWalletOverview,
  submitKYC,
  getKYC,
  topupWallet,
  withdrawToBank
} from "../Controllers/wallet.controller.js";
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

// Wallet Passcode endpoints
router.post("/passcode", isAuthenticated, createWalletPasscode);
router.post("/passcode/verify", isAuthenticated, verifyWalletPasscode);
router.put("/passcode", isAuthenticated, changeWalletPasscode);
router.get("/passcode/status", isAuthenticated, getWalletPasscodeStatus);
router.put("/passcode/:userId/reset", isAuthenticated, resetWalletPasscode);
router.put("/passcode/:userId/unlock", isAuthenticated, unlockWallet);
router.get("/passcode/locked", isAuthenticated, getLockedWallets);
router.delete("/passcode/:userId", isAuthenticated, deleteWalletPasscode);

export default router;
