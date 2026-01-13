import { stripe, getAppFeeCents, isStripeConfigured } from "../Services/stripe.service.js";
import { Transaction } from "../Models/transaction.model.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";
import { WorkorderServiceClient } from "../Services/workorder-client.service.js";
import { getKafkaProducer, TOPICS } from '../../shared-kafka/index.js';
import { BaseEvent } from '../../shared-kafka/event-schemas.js';

// Create or get Stripe customer
export const createOrGetStripeCustomer = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.stripe?.customerId) {
      return res.status(200).json({ success: true, customerId: user.stripe.customerId });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullname,
      metadata: { userId: String(user._id), role: user.role }
    });

    // Update user Stripe data via Auth Service
    await AuthServiceClient.updateUserStripeData(userId, { customerId: customer.id }, token);

    return res.status(201).json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error("createOrGetStripeCustomer error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create or get Stripe Connect account (for technicians)
export const createOrGetConnectAccount = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "Technician") {
      return res.status(403).json({ success: false, message: "Only technicians can create payout accounts" });
    }

    if (user.stripe?.connectAccountId) {
      // Refresh account status
      const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
      await AuthServiceClient.updateUserStripeData(userId, {
        connectChargesEnabled: !!acct.charges_enabled,
        detailsSubmitted: !!acct.details_submitted
      }, token);

      return res.status(200).json({
        success: true,
        accountId: user.stripe.connectAccountId,
        chargesEnabled: acct.charges_enabled,
        detailsSubmitted: acct.details_submitted
      });
    }

    // Create Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: { userId: String(user._id), role: user.role }
    });

    // Update user Stripe data via Auth Service
    await AuthServiceClient.updateUserStripeData(userId, {
      connectAccountId: account.id,
      connectChargesEnabled: !!account.charges_enabled,
      detailsSubmitted: !!account.details_submitted
    }, token);

    return res.status(201).json({
      success: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    });
  } catch (error) {
    console.error("createOrGetConnectAccount error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Connect onboarding link
export const createConnectOnboardingLink = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.stripe?.connectAccountId) {
      return res.status(400).json({ success: false, message: "No Connect account. Create account first." });
    }

    const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL || `${process.env.FRONTEND_URL}/onboarding/refresh`;
    const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL || `${process.env.FRONTEND_URL}/onboarding/return`;

    const link = await stripe.accountLinks.create({
      account: user.stripe.connectAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return res.status(200).json({ success: true, url: link.url });
  } catch (error) {
    console.error("createConnectOnboardingLink error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment intent for job payment
export const createPaymentIntentForJob = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const recruiterId = req.user.userId || req.user._id;
    const { workorderId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch recruiter from Auth Service
    const recruiter = await AuthServiceClient.getUser(recruiterId, token);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }

    if (recruiter.role !== "Recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can pay" });
    }

    // Fetch workorder from Workorder Service
    const workorder = await WorkorderServiceClient.getWorkorder(workorderId, token);
    if (!workorder) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!workorder.assignedApplicant) {
      return res.status(400).json({ success: false, message: "No technician assigned" });
    }

    if (!workorder.payableSalary || workorder.payableSalary <= 0) {
      return res.status(400).json({ success: false, message: "No payable salary calculated" });
    }

    // Fetch technician from Auth Service
    const technician = await AuthServiceClient.getUser(workorder.assignedApplicant, token);
    if (!technician?.stripe?.connectAccountId) {
      return res.status(400).json({ success: false, message: "Technician is not onboarded for payouts" });
    }

    // Ensure recruiter has a customer
    if (!recruiter.stripe?.customerId) {
      const customer = await stripe.customers.create({
        email: recruiter.email,
        name: recruiter.fullname,
        metadata: { userId: String(recruiter._id), role: recruiter.role }
      });
      await AuthServiceClient.updateUserStripeData(recruiterId, { customerId: customer.id }, token);
    }

    // Convert salary to cents
    const amountCents = Math.round(Number(workorder.payableSalary) * 100);
    const applicationFeeCents = getAppFeeCents(amountCents);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: recruiter.stripe.customerId,
      automatic_payment_methods: { enabled: true },
      transfer_data: {
        destination: technician.stripe.connectAccountId,
      },
      application_fee_amount: applicationFeeCents,
      metadata: {
        workorderId: String(workorder._id),
        recruiterId: String(recruiter._id),
        technicianId: String(technician._id),
      },
    });

    // Create transaction record
    await Transaction.create({
      workorder: workorder._id,
      recruiter: recruiter._id,
      technician: technician._id,
      currency: "usd",
      amountCents,
      applicationFeeCents,
      destinationAccountId: technician.stripe.connectAccountId,
      stripePaymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      paymentProvider: 'stripe',
      events: [{ type: "payment_intent.created", payload: { id: paymentIntent.id } }]
    });

    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("createPaymentIntentForJob error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create checkout session for job payment
export const createCheckoutSessionForJob = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const recruiterId = req.user.userId || req.user._id;
    const { workorderId } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch recruiter from Auth Service
    const recruiter = await AuthServiceClient.getUser(recruiterId, token);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }

    if (recruiter.role !== "Recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can pay" });
    }

    // Fetch workorder from Workorder Service
    const workorder = await WorkorderServiceClient.getWorkorder(workorderId, token);
    if (!workorder) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!workorder.assignedApplicant) {
      return res.status(400).json({ success: false, message: "No technician assigned" });
    }

    if (!workorder.payableSalary || workorder.payableSalary <= 0) {
      return res.status(400).json({ success: false, message: "No payable salary calculated" });
    }

    // Fetch technician from Auth Service
    const technician = await AuthServiceClient.getUser(workorder.assignedApplicant, token);
    if (!technician?.stripe?.connectAccountId) {
      return res.status(400).json({ success: false, message: "Technician is not onboarded for payouts" });
    }

    // Ensure recruiter has a customer
    if (!recruiter.stripe?.customerId) {
      const customer = await stripe.customers.create({
        email: recruiter.email,
        name: recruiter.fullname,
        metadata: { userId: String(recruiter._id), role: recruiter.role }
      });
      await AuthServiceClient.updateUserStripeData(recruiterId, { customerId: customer.id }, token);
    }

    const successUrl = `${process.env.FRONTEND_URL}/payment/success?workorderId=${workorderId}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel?workorderId=${workorderId}`;

    const amountCents = Math.round(Number(workorder.payableSalary) * 100);
    const applicationFeeCents = getAppFeeCents(amountCents);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: recruiter.stripe.customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: workorder.title || "Job Payment",
              description: `Payment for job ${workorder._id}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: { destination: technician.stripe.connectAccountId },
        application_fee_amount: applicationFeeCents,
        metadata: {
          workorderId: String(workorder._id),
          recruiterId: String(recruiter._id),
          technicianId: String(technician._id),
        },
      },
      client_reference_id: String(workorder._id),
      metadata: { workorderId: String(workorder._id) },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(201).json({ success: true, url: session.url, id: session.id });
  } catch (error) {
    console.error("createCheckoutSessionForJob error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List transactions
export const listTransactions = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const role = req.user.role;

    let filter = {};
    if (role === "Recruiter") {
      filter.recruiter = userId;
    } else if (role === "Technician") {
      filter.technician = userId;
    } else {
      filter = { $or: [{ recruiter: userId }, { technician: userId }] };
    }

    const txs = await Transaction.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, transactions: txs });
  } catch (error) {
    console.error("listTransactions error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer info
export const getCustomerInfo = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.stripe?.customerId) {
      return res.status(404).json({ success: false, message: 'Customer not found for user' });
    }

    const customer = await stripe.customers.retrieve(user.stripe.customerId);
    const safe = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      created: customer.created,
      default_source: customer.default_source,
      currency: customer.currency,
    };
    return res.status(200).json({ success: true, customer: safe });
  } catch (error) {
    console.error('getCustomerInfo error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create setup intent for payment methods
export const createSetupIntent = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.stripe?.customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullname,
        metadata: { userId: String(user._id), role: user.role }
      });
      await AuthServiceClient.updateUserStripeData(userId, { customerId: customer.id }, token);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripe.customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return res.status(201).json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    });
  } catch (error) {
    console.error('createSetupIntent error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List payment methods
export const listPaymentMethods = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user?.stripe?.customerId) {
      return res.status(404).json({ success: false, message: 'No customer found' });
    }

    const pms = await stripe.paymentMethods.list({ customer: user.stripe.customerId, type: 'card' });
    const safe = pms.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
    }));
    return res.status(200).json({ success: true, paymentMethods: safe });
  } catch (error) {
    console.error('listPaymentMethods error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Detach payment method
export const detachPaymentMethod = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }

    const { pmId } = req.params;
    const detached = await stripe.paymentMethods.detach(pmId);
    return res.status(200).json({ success: true, paymentMethod: { id: detached.id } });
  } catch (error) {
    console.error('detachPaymentMethod error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Connect account info
export const getConnectAccountInfo = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Stripe payment processing is not configured. Please contact support."
      });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user?.stripe?.connectAccountId) {
      return res.status(404).json({ success: false, message: 'No connect account found' });
    }

    const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
    const external_accounts = (acct.external_accounts?.data || []).map(a => ({
      id: a.id,
      bank_name: a.bank_name,
      last4: a.last4,
      country: a.country,
      currency: a.currency,
      account_holder_name: a.account_holder_name
    }));

    const safe = {
      id: acct.id,
      email: acct.email,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      details_submitted: acct.details_submitted,
      requirements: acct.requirements ? {
        currently_due: acct.requirements.currently_due,
        past_due: acct.requirements.past_due,
        eventually_due: acct.requirements.eventually_due,
      } : undefined,
      external_accounts,
    };
    return res.status(200).json({ success: true, account: safe });
  } catch (error) {
    console.error('getConnectAccountInfo error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Connect balance
export const getConnectBalance = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Stripe payment processing is not configured. Please contact support."
      });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user?.stripe?.connectAccountId) {
      return res.status(404).json({ success: false, message: 'No connect account found' });
    }

    const balance = await stripe.balance.retrieve({ stripeAccount: user.stripe.connectAccountId });
    return res.status(200).json({ success: true, balance });
  } catch (error) {
    console.error('getConnectBalance error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe webhook handler
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (!isStripeConfigured()) {
      throw new Error("Stripe not configured on server");
    }
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;

        // Update transaction status
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: pi.status, $push: { events: { type: event.type, payload: pi } } }
        );

        // Handle wallet top-up
        if (pi.metadata?.type === 'wallet_topup') {
          const userId = pi.metadata.userId;
          const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

          try {
            const user = await AuthServiceClient.getUser(userId, token);
            if (user) {
              await AuthServiceClient.updateUserWalletBalance(
                userId,
                pi.amount / 100,
                'add',
                token
              );
            }
          } catch (error) {
            console.error('Error updating wallet balance in webhook:', error);
          }
        }

        // Mark job as paid
        const { workorderId } = pi.metadata || {};
        if (workorderId) {
          try {
            const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
            await WorkorderServiceClient.updateWorkorderPaymentStatus(
              workorderId,
              { status: "Paid", paidTime: new Date() },
              token
            );
          } catch (error) {
            console.error('Error updating workorder status in webhook:', error);
          }
        }

        // Publish payment.completed event
        try {
          const producer = getKafkaProducer('payment-service');
          const paymentEvent = new BaseEvent(TOPICS.PAYMENT_COMPLETED, {
            paymentId: pi.id,
            jobId: pi.metadata?.workorderId,
            amount: pi.amount / 100,
            currency: pi.currency,
            technicianId: pi.metadata?.technicianId,
            clientId: pi.metadata?.recruiterId
          }, { source: 'payment-service' });

          await producer.publishEvent(TOPICS.PAYMENT_COMPLETED, paymentEvent);
          console.log('✅ Published payment.completed event for:', pi.id);
        } catch (kafkaError) {
          console.error('⚠️ Failed to publish payment.completed event:', kafkaError);
        }
        break;
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
      case "payment_intent.processing":
      case "payment_intent.requires_action":
      case "payment_intent.requires_capture":
      case "payment_intent.created": {
        const pi = event.data.object;
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: pi.status, $push: { events: { type: event.type, payload: pi } } },
          { upsert: false }
        );
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("stripeWebhook handler error", error);
    return res.status(500).send("Internal handler error");
  }

  res.json({ received: true });
};
