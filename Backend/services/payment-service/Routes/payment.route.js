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
  stripeWebhook
} from "../Controllers/payment.controller.js";

const router = express.Router();

// Stripe webhook endpoint (must use raw body parser)
// This route is registered separately in index.js BEFORE express.json middleware
// router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Recruiter endpoints
router.post("/customer", isAuthenticated, createOrGetStripeCustomer);

// Technician endpoints
router.post("/connect", isAuthenticated, createOrGetConnectAccount);
router.post("/connect/onboarding-link", isAuthenticated, createConnectOnboardingLink);
router.get("/connect/account", isAuthenticated, getConnectAccountInfo);
router.get("/connect/balance", isAuthenticated, getConnectBalance);

// Payment endpoints
router.post("/pay/:workorderId", isAuthenticated, createPaymentIntentForJob);
router.post("/checkout/:workorderId", isAuthenticated, createCheckoutSessionForJob);
router.get("/transactions", isAuthenticated, listTransactions);
router.get("/customer", isAuthenticated, getCustomerInfo);

// Payment methods
router.post("/setup-intent", isAuthenticated, createSetupIntent);
router.get("/payment-methods", isAuthenticated, listPaymentMethods);
router.delete("/payment-methods/:pmId", isAuthenticated, detachPaymentMethod);

export default router;
