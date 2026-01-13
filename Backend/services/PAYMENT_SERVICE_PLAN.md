# Payment Service - Implementation Plan

## ✅ What Has Been Created

### Base Structure
- ✅ `package.json` - Dependencies (Stripe, PayPal SDK)
- ✅ `index.js` - Express server setup
- ✅ `utils/db.js` - Database connection
- ✅ `utils/s3Upload.js` - S3 upload utility
- ✅ `middleware/isAuthenticated.js` - Auth middleware
- ✅ `middleware/multer.js` - File upload middleware

### Services
- ✅ `Services/stripe.service.js` - Stripe service wrapper
- ✅ `Services/paypal.service.js` - PayPal service (placeholder)
- ✅ `Services/auth-client.service.js` - Auth Service client
- ✅ `Services/workorder-client.service.js` - Workorder Service client

### Models
- ✅ `Models/transaction.model.js` - Payment transactions (no cross-service refs)
- ✅ `Models/wallet.model.js` - Wallet model (no cross-service refs)
- ✅ `Models/walletTransaction.model.js` - Wallet transactions (no cross-service refs)

## 🔨 What Needs to Be Created

### Controllers (High Priority)
1. **Payment Controllers** (`Controllers/payment.controller.js`)
   - `createOrGetStripeCustomer` - Create/get Stripe customer
   - `createOrGetConnectAccount` - Create/get Stripe Connect account
   - `createConnectOnboardingLink` - Stripe onboarding link
   - `createPaymentIntentForJob` - Create payment intent for job
   - `createCheckoutSessionForJob` - Create checkout session
   - `stripeWebhook` - Handle Stripe webhooks
   - `listTransactions` - List payment transactions
   - `getCustomerInfo` - Get Stripe customer info
   - `createSetupIntent` - Create setup intent for payment methods
   - `listPaymentMethods` - List saved payment methods
   - `detachPaymentMethod` - Remove payment method
   - `getConnectAccountInfo` - Get Connect account info
   - `getConnectBalance` - Get Connect account balance

2. **Wallet Controllers** (`Controllers/wallet.controller.js`)
   - `getWalletOverview` - Get wallet overview
   - `topupWallet` - Top up wallet balance
   - `withdrawToBank` - Withdraw funds to bank
   - `submitKYC` - Submit KYC documents
   - `getKYC` - Get KYC status

3. **PayPal Controllers** (`Controllers/paypal.controller.js`) - Future
   - `createPayPalOrder` - Create PayPal order
   - `capturePayPalOrder` - Capture PayPal payment
   - `payPalWebhook` - Handle PayPal webhooks

### Routes
- ✅ `Routes/payment.route.js` - Payment routes (needs implementation)
- ✅ `Routes/wallet.route.js` - Wallet routes (needs implementation)

### Configuration
- ✅ `.env.example` - Environment variables template (needs creation)
- ✅ `.gitignore` - Git ignore rules (needs creation)
- ✅ `README.md` - Service documentation (needs creation)

## 📋 Implementation Steps

### Step 1: Complete Payment Controllers
Extract and adapt payment controllers from `Backend/Controllers/wallet.controller.js`:
- Update to use `AuthServiceClient` instead of direct User model access
- Update to use `WorkorderServiceClient` instead of direct Workorder model access
- Handle Stripe operations via `stripe.service.js`
- Store transaction data in `Transaction` model

### Step 2: Complete Wallet Controllers
Extract wallet operations:
- Wallet overview
- Top-up operations
- Withdrawal operations
- KYC submission

### Step 3: Set Up Routes
Create route files:
- Payment routes with webhook endpoint (needs `express.raw` middleware)
- Wallet routes

### Step 4: Add PayPal Integration
Implement PayPal controllers:
- Order creation
- Payment capture
- Webhook handling

### Step 5: Create Documentation
- Service README
- API documentation
- Integration guide

## 🔄 Integration Points

### With Auth Service
- Fetch user data
- Update user Stripe data (customerId, connectAccountId)
- Update user wallet balance
- Update user KYC data

### With Workorder Service
- Fetch workorder data
- Update workorder payment status

### With Notification Service (Future)
- Send payment notifications
- Send transaction confirmations

## ⚠️ Important Notes

1. **Stripe Webhook**: Must use `express.raw({ type: "application/json" })` middleware
2. **User Stripe Data**: Currently stored in User model - needs to be updated via Auth Service
3. **Wallet Balance**: Currently stored in User model - needs to be updated via Auth Service
4. **PayPal**: Placeholder implementation - needs full integration
5. **KYC**: Currently stored in User model - needs to be updated via Auth Service

## 🚀 Next Steps

1. Create payment controllers
2. Create wallet controllers
3. Set up routes
4. Test Stripe integration
5. Implement PayPal integration
6. Create documentation
