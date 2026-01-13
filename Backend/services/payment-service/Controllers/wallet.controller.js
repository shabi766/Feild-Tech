import { stripe, isStripeConfigured } from "../Services/stripe.service.js";
import { Transaction } from "../Models/transaction.model.js";
import { AuthServiceClient } from "../Services/auth-client.service.js";
import { uploadToS3 } from "../utils/s3Upload.js";

// Get wallet overview
export const getWalletOverview = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const role = user.role;
    const overview = { role };
    
    // Add wallet balance for all users
    overview.walletBalance = user.walletBalance || 0;
    
    if (role === 'Recruiter' || role === 'Admin') {
      let customer = null, paymentMethods = [];
      if (isStripeConfigured() && user.stripe?.customerId) {
        try {
          const c = await stripe.customers.retrieve(user.stripe.customerId);
          customer = { 
            id: c.id, 
            name: c.name, 
            email: c.email, 
            phone: c.phone, 
            address: c.address 
          };
          const pms = await stripe.paymentMethods.list({ customer: user.stripe.customerId, type: 'card' });
          paymentMethods = pms.data.map(pm => ({ 
            id: pm.id, 
            brand: pm.card?.brand, 
            last4: pm.card?.last4, 
            exp_month: pm.card?.exp_month, 
            exp_year: pm.card?.exp_year 
          }));
        } catch (error) {
          console.error('Error fetching Stripe customer data:', error);
        }
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
      if (isStripeConfigured() && user.stripe?.connectAccountId) {
        try {
          const acct = await stripe.accounts.retrieve(user.stripe.connectAccountId);
          account = { 
            id: acct.id, 
            charges_enabled: acct.charges_enabled, 
            payouts_enabled: acct.payouts_enabled, 
            details_submitted: acct.details_submitted 
          };
          balance = await stripe.balance.retrieve({ stripeAccount: user.stripe.connectAccountId });
        } catch (error) {
          console.error('Error fetching Stripe Connect account data:', error);
        }
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

// Submit KYC
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
    const { fatherName, cnicNumber, dateOfBirth } = req.body;
    const files = req.files || {};
    
    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let cnicFrontUrl = user.kyc?.cnicFrontUrl;
    let cnicBackUrl = user.kyc?.cnicBackUrl;
    
    // Upload files to S3
    if (files.cnicFront && files.cnicFront[0]) {
      cnicFrontUrl = await uploadToS3(files.cnicFront[0], 'kyc');
    }
    if (files.cnicBack && files.cnicBack[0]) {
      cnicBackUrl = await uploadToS3(files.cnicBack[0], 'kyc');
    }
    
    // Prepare KYC data
    const kycData = {
      fatherName: fatherName || user.kyc?.fatherName,
      cnicNumber: cnicNumber || user.kyc?.cnicNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : (user.kyc?.dateOfBirth || undefined),
      cnicFrontUrl,
      cnicBackUrl,
      kycStatus: 'pending',
    };
    
    // Update KYC via Auth Service
    await AuthServiceClient.updateUserKYC(userId, kycData, token);

    // Automatically create Stripe customer for wallet functionality
    if (isStripeConfigured() && !user.stripe?.customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullname,
          metadata: { userId: String(user._id), role: user.role }
        });
        await AuthServiceClient.updateUserStripeData(userId, { customerId: customer.id }, token);
      } catch (stripeError) {
        console.error('Failed to create Stripe customer during KYC:', stripeError);
        // Don't fail KYC submission if Stripe customer creation fails
      }
    }

    return res.status(200).json({ success: true, kyc: kycData });
  } catch (error) {
    console.error('submitKYC error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get KYC
export const getKYC = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      kyc: user.kyc, 
      user: { 
        fullname: user.fullname, 
        email: user.email, 
        phoneNumber: user.phoneNumber 
      } 
    });
  } catch (error) {
    console.error('getKYC error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Top up wallet
export const topupWallet = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }
    
    const { amountCents } = req.body;
    if (!amountCents || amountCents < 100) {
      return res.status(400).json({ success: false, message: "Minimum amount is $1.00" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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

// Withdraw to bank
export const withdrawToBank = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(500).json({ success: false, message: "Stripe not configured on server" });
    }
    
    const { amountCents, bankAccount } = req.body;
    if (!amountCents || amountCents < 100) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is $1.00" });
    }

    const userId = req.user.userId || req.user._id;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    // Fetch user from Auth Service
    const user = await AuthServiceClient.getUser(userId, token);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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

    // Update local wallet balance via Auth Service
    await AuthServiceClient.updateUserWalletBalance(
      userId, 
      amountCents / 100, 
      'subtract', 
      token
    );

    return res.status(200).json({ 
      success: true, 
      transferId: transfer.id,
      message: "Withdrawal initiated successfully"
    });
  } catch (error) {
    console.error("withdrawToBank error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
