import 'dotenv/config';
import Stripe from "stripe";
import { User } from "../Models/user.model.js";
import { Workorder } from "../Models/workorder.model.js";
import { Transaction } from "../Models/transaction.model.js";
import { uploadToS3 } from "../utils/s3Upload.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Stripe secret key missing. Set STRIPE_SECRET_KEY in backend env.");
}
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// 10% platform fee
const PLATFORM_FEE_PERCENT = 10;

const getAppFeeCents = (amountCents) => Math.floor((amountCents * PLATFORM_FEE_PERCENT) / 100);

export const createOrGetStripeCustomer = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.stripe?.customerId) {
      return res.status(200).json({ success: true, customerId: user.stripe.customerId });
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullname,
      metadata: { userId: String(user._id), role: user.role }
    });

    user.stripe.customerId = customer.id;
    await user.save();

    return res.status(201).json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error("createOrGetStripeCustomer error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrGetConnectAccount = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== "Technician") {
      return res.status(403).json({ success: false, message: "Only technicians can create payout accounts" });
    }

    if (user.stripe?.connectAccountId) {
      // Refresh account status
      const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
      user.stripe.connectChargesEnabled = !!acct.charges_enabled;
      user.stripe.detailsSubmitted = !!acct.details_submitted;
      await user.save();
      return res.status(200).json({ success: true, accountId: user.stripe.connectAccountId, chargesEnabled: acct.charges_enabled, detailsSubmitted: acct.details_submitted });
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: { userId: String(user._id), role: user.role }
    });

    user.stripe.connectAccountId = account.id;
    user.stripe.connectChargesEnabled = !!account.charges_enabled;
    user.stripe.detailsSubmitted = !!account.details_submitted;
    await user.save();

    return res.status(201).json({ success: true, accountId: account.id, chargesEnabled: account.charges_enabled, detailsSubmitted: account.details_submitted });
  } catch (error) {
    console.error("createOrGetConnectAccount error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createConnectOnboardingLink = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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

// Recruiter pays technician for a completed job
export const createPaymentIntentForJob = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const recruiterId = req.user._id;
    const { workorderId } = req.params;
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter not found" });
    if (recruiter.role !== "Recruiter") return res.status(403).json({ success: false, message: "Only recruiters can pay" });

    const workorder = await Workorder.findById(workorderId).populate("assignedApplicant");
    if (!workorder) return res.status(404).json({ success: false, message: "Job not found" });
    if (!workorder.assignedApplicant) return res.status(400).json({ success: false, message: "No technician assigned" });
    if (!workorder.payableSalary || workorder.payableSalary <= 0) return res.status(400).json({ success: false, message: "No payable salary calculated" });

    const technician = await User.findById(workorder.assignedApplicant._id);
    if (!technician?.stripe?.connectAccountId) return res.status(400).json({ success: false, message: "Technician is not onboarded for payouts" });

    // Ensure recruiter has a customer for saved payment methods
    if (!recruiter.stripe?.customerId) {
      const customer = await stripe.customers.create({ email: recruiter.email, name: recruiter.fullname, metadata: { userId: String(recruiter._id), role: recruiter.role } });
      recruiter.stripe.customerId = customer.id;
      await recruiter.save();
    }

    // Convert salary to cents
    const amountCents = Math.round(Number(workorder.payableSalary) * 100);
    const applicationFeeCents = getAppFeeCents(amountCents);

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
      events: [{ type: "payment_intent.created", payload: { id: paymentIntent.id } }]
    });

    return res.status(201).json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("createPaymentIntentForJob error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCheckoutSessionForJob = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const recruiterId = req.user._id;
    const { workorderId } = req.params;
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter not found" });
    if (recruiter.role !== "Recruiter") return res.status(403).json({ success: false, message: "Only recruiters can pay" });

    const workorder = await Workorder.findById(workorderId).populate("assignedApplicant");
    if (!workorder) return res.status(404).json({ success: false, message: "Job not found" });
    if (!workorder.assignedApplicant) return res.status(400).json({ success: false, message: "No technician assigned" });
    if (!workorder.payableSalary || workorder.payableSalary <= 0) return res.status(400).json({ success: false, message: "No payable salary calculated" });

    const technician = await User.findById(workorder.assignedApplicant._id);
    if (!technician?.stripe?.connectAccountId) return res.status(400).json({ success: false, message: "Technician is not onboarded for payouts" });

    // Ensure recruiter has a customer to attach to the checkout
    if (!recruiter.stripe?.customerId) {
      const customer = await stripe.customers.create({ email: recruiter.email, name: recruiter.fullname, metadata: { userId: String(recruiter._id), role: recruiter.role } });
      recruiter.stripe.customerId = customer.id;
      await recruiter.save();
    }

    const successUrl = `${process.env.FRONTEND_URL}/payment/success?workorderId=${workorderId}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel?workorderId=${workorderId}`;

    const amountCents = Math.round(Number(workorder.payableSalary) * 100);
    const applicationFeeCents = getAppFeeCents(amountCents);

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

export const listTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let filter = {};
    if (role === "Recruiter") filter.recruiter = userId;
    else if (role === "Technician") filter.technician = userId;
    else filter = { $or: [{ recruiter: userId }, { technician: userId }] };

    const txs = await Transaction.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, transactions: txs });
  } catch (error) {
    console.error("listTransactions error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    if (!stripe) throw new Error("Stripe not configured on server");
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: pi.status, $push: { events: { type: event.type, payload: pi } } }
        );
        
        // Handle wallet top-up
        if (pi.metadata?.type === 'wallet_topup') {
          const userId = pi.metadata.userId;
          const user = await User.findById(userId);
          if (user) {
            user.walletBalance += pi.amount / 100;
            await user.save();
          }
        }
        
        // Mark job paid
        const { workorderId } = pi.metadata || {};
        if (workorderId) {
          await Workorder.findByIdAndUpdate(workorderId, { status: "Paid", paidTime: new Date() });
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

// Customer details (Recruiter)
export const getCustomerInfo = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.stripe?.customerId) return res.status(404).json({ success: false, message: 'Customer not found for user' });
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

export const createSetupIntent = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.stripe?.customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.fullname, metadata: { userId: String(user._id), role: user.role } });
      user.stripe.customerId = customer.id;
      await user.save();
    }
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripe.customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });
    return res.status(201).json({ success: true, clientSecret: setupIntent.client_secret, setupIntentId: setupIntent.id });
  } catch (error) {
    console.error('createSetupIntent error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const listPaymentMethods = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const user = await User.findById(req.user._id);
    if (!user?.stripe?.customerId) return res.status(404).json({ success: false, message: 'No customer found' });
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

export const detachPaymentMethod = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    const { pmId } = req.params;
    const detached = await stripe.paymentMethods.detach(pmId);
    return res.status(200).json({ success: true, paymentMethod: { id: detached.id } });
  } catch (error) {
    console.error('detachPaymentMethod error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Connect account details (Technician)
export const getConnectAccountInfo = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        message: "Stripe payment processing is not configured. Please contact support." 
      });
    }
    const user = await User.findById(req.user._id);
    if (!user?.stripe?.connectAccountId) return res.status(404).json({ success: false, message: 'No connect account found' });
    const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
    const external_accounts = (acct.external_accounts?.data || []).map(a => ({ id: a.id, bank_name: a.bank_name, last4: a.last4, country: a.country, currency: a.currency, account_holder_name: a.account_holder_name }));
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

export const getConnectBalance = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        message: "Stripe payment processing is not configured. Please contact support." 
      });
    }
    const user = await User.findById(req.user._id);
    if (!user?.stripe?.connectAccountId) return res.status(404).json({ success: false, message: 'No connect account found' });
    const balance = await stripe.balance.retrieve({ stripeAccount: user.stripe.connectAccountId });
    return res.status(200).json({ success: true, balance });
  } catch (error) {
    console.error('getConnectBalance error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWalletOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const role = user.role;
    const overview = { role };
    
    // Add wallet balance for all users
    overview.walletBalance = user.walletBalance || 0;
    
    if (role === 'Recruiter' || role === 'Admin') {
      let customer = null, paymentMethods = [];
      if (stripe && user.stripe?.customerId) {
        const c = await stripe.customers.retrieve(user.stripe.customerId);
        customer = { id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address };
        const pms = await stripe.paymentMethods.list({ customer: user.stripe.customerId, type: 'card' });
        paymentMethods = pms.data.map(pm => ({ id: pm.id, brand: pm.card?.brand, last4: pm.card?.last4, exp_month: pm.card?.exp_month, exp_year: pm.card?.exp_year }));
      }
      const txs = await Transaction.find({ recruiter: user._id }).sort({ createdAt: -1 }).limit(20);
      overview.recruiter = { 
        customer, 
        paymentMethods, 
        transactions: txs,
        walletBalance: user.walletBalance || 0
      };
    }
    if (role === 'Technician') {
      let account = null, balance = null;
      if (stripe && user.stripe?.connectAccountId) {
        const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
        account = { id: acct.id, charges_enabled: acct.charges_enabled, payouts_enabled: acct.payouts_enabled, details_submitted: acct.details_submitted };
        balance = await stripe.balance.retrieve({ stripeAccount: user.stripe.connectAccountId });
      }
      const txs = await Transaction.find({ technician: user._id }).sort({ createdAt: -1 }).limit(20);
      overview.technician = { 
        account, 
        balance, 
        transactions: txs,
        walletBalance: user.walletBalance || 0
      };
    }
    return res.status(200).json({ success: true, overview });
  } catch (error) {
    console.error('getWalletOverview error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-app onboarding: capture KYC and mark pending
export const submitKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { fatherName, cnicNumber, dateOfBirth } = req.body;
    const files = req.files || [];
    let cnicFrontUrl = user.kyc?.cnicFrontUrl;
    let cnicBackUrl = user.kyc?.cnicBackUrl;
    for (const f of files) {
      if (f.fieldname === 'cnicFront') cnicFrontUrl = await uploadToS3(f, 'kyc');
      if (f.fieldname === 'cnicBack') cnicBackUrl = await uploadToS3(f, 'kyc');
    }
    user.kyc = {
      fatherName: fatherName || user.kyc?.fatherName,
      cnicNumber: cnicNumber || user.kyc?.cnicNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : (user.kyc?.dateOfBirth || undefined),
      cnicFrontUrl,
      cnicBackUrl,
      kycStatus: 'pending',
    };

    // Automatically create Stripe customer for wallet functionality
    if (stripe && !user.stripe?.customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullname,
          metadata: { userId: String(user._id), role: user.role }
        });
        user.stripe = { ...user.stripe, customerId: customer.id };
      } catch (stripeError) {
        console.error('Failed to create Stripe customer during KYC:', stripeError);
        // Don't fail KYC submission if Stripe customer creation fails
      }
    }

    await user.save();
    return res.status(200).json({ success: true, kyc: user.kyc });
  } catch (error) {
    console.error('submitKYC error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kyc fullname email phoneNumber');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, kyc: user.kyc, user: { fullname: user.fullname, email: user.email, phoneNumber: user.phoneNumber } });
  } catch (error) {
    console.error('getKYC error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Wallet top-up functionality
export const topupWallet = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    
    const { amountCents } = req.body;
    if (!amountCents || amountCents < 100) {
      return res.status(400).json({ success: false, message: "Minimum amount is $1.00" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Ensure user has a Stripe customer
    if (!user.stripe?.customerId) {
      return res.status(400).json({ success: false, message: "Please complete KYC first to create wallet" });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: user.stripe.customerId,
      metadata: { 
        userId: String(user._id), 
        type: 'wallet_topup',
        role: user.role 
      }
    });

    return res.status(200).json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error("topupWallet error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Wallet withdrawal functionality
export const withdrawToBank = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    
    const { amountCents, bankAccount } = req.body;
    if (!amountCents || amountCents < 100) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is $1.00" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== 'Technician') {
      return res.status(403).json({ success: false, message: "Only technicians can withdraw funds" });
    }

    // Check if user has sufficient balance
    if (user.walletBalance < amountCents / 100) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    }

    // Check if user has a Stripe Connect account
    if (!user.stripe?.connectAccountId) {
      return res.status(400).json({ success: false, message: "Please complete Stripe onboarding first" });
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: user.stripe.connectAccountId,
      metadata: { 
        userId: String(user._id), 
        type: 'wallet_withdrawal',
        bankAccount 
      }
    });

    // Update local wallet balance
    user.walletBalance -= amountCents / 100;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      transferId: transfer.id,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error("withdrawToBank error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


