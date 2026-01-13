/**
 * Stripe Service
 * Handles all Stripe-related operations
 */

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Stripe secret key missing. Set STRIPE_SECRET_KEY in payment service env.");
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Platform fee percentage (10%)
export const PLATFORM_FEE_PERCENT = 10;

export const getAppFeeCents = (amountCents) => Math.floor((amountCents * PLATFORM_FEE_PERCENT) / 100);

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = () => {
  return stripe !== null;
};
