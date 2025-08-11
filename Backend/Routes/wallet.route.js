import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
  createOrGetStripeCustomer,
  createOrGetConnectAccount,
  createConnectOnboardingLink,
  createPaymentIntentForJob,
  createCheckoutSessionForJob,
  listTransactions,
  getCustomerInfo,
  createSetupIntent,
  listPaymentMethods,
  detachPaymentMethod,
  getConnectAccountInfo,
  getConnectBalance,
  getWalletOverview,
  submitKYC,
  getKYC,
  topupWallet,
  withdrawToBank,
} from "../Controllers/wallet.controller.js";
import { multipleUpload } from "../middleware/multer.js";

const router = express.Router();

// Recruiter endpoints
router.post("/customer", isAuthenticated, createOrGetStripeCustomer);

// Technician endpoints
router.post("/connect", isAuthenticated, createOrGetConnectAccount);
router.post("/connect/onboarding-link", isAuthenticated, createConnectOnboardingLink);

// Payments
router.post("/pay/:workorderId", isAuthenticated, createPaymentIntentForJob);
router.post("/checkout/:workorderId", isAuthenticated, createCheckoutSessionForJob);
router.get("/transactions", isAuthenticated, listTransactions);
router.get("/customer", isAuthenticated, getCustomerInfo);
router.post("/setup-intent", isAuthenticated, createSetupIntent);
router.get("/payment-methods", isAuthenticated, listPaymentMethods);
router.delete("/payment-methods/:pmId", isAuthenticated, detachPaymentMethod);
router.get("/connect/account", isAuthenticated, getConnectAccountInfo);
router.get("/connect/balance", isAuthenticated, getConnectBalance);
router.get("/overview", isAuthenticated, getWalletOverview);
router.get("/kyc", isAuthenticated, getKYC);
router.post("/kyc", isAuthenticated, multipleUpload, submitKYC);

// Wallet operations
router.post("/topup", isAuthenticated, topupWallet);
router.post("/withdraw", isAuthenticated, withdrawToBank);

// Stripe webhook is mounted in server entry with raw body parser

export default router;


