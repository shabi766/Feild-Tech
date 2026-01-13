# Payment Service - Implementation Summary

## ✅ What Was Created

### Directory Structure

```
services/payment-service/
├── Controllers/
│   ├── payment.controller.js      # Stripe payment operations
│   └── wallet.controller.js       # Wallet and KYC operations
├── Models/
│   ├── transaction.model.js      # Payment transactions (no cross-service refs)
│   ├── wallet.model.js            # Wallet model (no cross-service refs)
│   └── walletTransaction.model.js # Wallet transactions (no cross-service refs)
├── Routes/
│   ├── payment.route.js           # Payment routes
│   └── wallet.route.js            # Wallet routes
├── Services/
│   ├── stripe.service.js          # Stripe service wrapper
│   ├── paypal.service.js           # PayPal service (placeholder)
│   ├── auth-client.service.js     # Auth Service client
│   └── workorder-client.service.js # Workorder Service client
├── middleware/
│   ├── isAuthenticated.js         # Auth middleware using shared package
│   └── multer.js                  # File upload middleware
├── utils/
│   ├── db.js                      # Database connection
│   └── s3Upload.js                # S3 upload utility
├── index.js                       # Express server with webhook setup
├── package.json                   # Dependencies (Stripe, PayPal SDK)
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # Service documentation
```

## 🔑 Key Features

### Payment Service Endpoints

**Stripe Operations:**
1. **POST /api/v1/payment/customer** - Create/get Stripe customer
2. **POST /api/v1/payment/connect** - Create/get Connect account (technicians)
3. **POST /api/v1/payment/connect/onboarding-link** - Get onboarding link
4. **GET /api/v1/payment/connect/account** - Get Connect account info
5. **GET /api/v1/payment/connect/balance** - Get Connect balance
6. **POST /api/v1/payment/pay/:workorderId** - Create payment intent
7. **POST /api/v1/payment/checkout/:workorderId** - Create checkout session
8. **GET /api/v1/payment/transactions** - List transactions
9. **GET /api/v1/payment/customer** - Get customer info
10. **POST /api/v1/payment/setup-intent** - Create setup intent
11. **GET /api/v1/payment/payment-methods** - List payment methods
12. **DELETE /api/v1/payment/payment-methods/:pmId** - Remove payment method
13. **POST /api/v1/payment/webhook** - Stripe webhook handler

**Wallet Operations:**
1. **GET /api/v1/wallet/overview** - Get wallet overview
2. **GET /api/v1/wallet/kyc** - Get KYC status
3. **POST /api/v1/wallet/kyc** - Submit KYC documents
4. **POST /api/v1/wallet/topup** - Top up wallet
5. **POST /api/v1/wallet/withdraw** - Withdraw funds

**Health Check:**
- **GET /health** - Service health check

## 🏗️ Architecture Decisions

### Model Design

**✅ Removed Cross-Service References:**
- `Transaction.workorder`: Changed from `ref: 'Workorder'` to ID only
- `Transaction.recruiter`: Changed from `ref: 'User'` to ID only
- `Transaction.technician`: Changed from `ref: 'User'` to ID only
- `Wallet.ownerId`: No ref (determined by ownerType)
- `WalletTransaction.userId`: No ref to User

**✅ Service Clients:**
- `AuthServiceClient` - Fetches/updates user data, Stripe data, wallet balance, KYC
- `WorkorderServiceClient` - Fetches workorder data, updates payment status

### Controller Updates

**Before (Monolithic):**
```javascript
const user = await User.findById(userId);
user.stripe.customerId = customer.id;
await user.save();
```

**After (Microservice):**
```javascript
const user = await AuthServiceClient.getUser(userId, token);
await AuthServiceClient.updateUserStripeData(userId, { customerId: customer.id }, token);
```

## 🔄 Integration Points

### With Auth Service
- **GET /api/v1/auth/users/:userId** - Fetch user data
- **PATCH /api/v1/auth/users/:userId/stripe** - Update Stripe data
- **PATCH /api/v1/auth/users/:userId/wallet** - Update wallet balance
- **PATCH /api/v1/auth/users/:userId/kyc** - Update KYC data

### With Workorder Service
- **GET /api/v1/workorder/get/:workorderId** - Fetch workorder data
- **PUT /api/v1/workorder/update/:workorderId** - Update payment status

## 📋 Stripe Webhook Events Handled

- `payment_intent.succeeded` - Update transaction, wallet balance, workorder status
- `payment_intent.payment_failed` - Update transaction status
- `payment_intent.canceled` - Update transaction status
- `payment_intent.processing` - Update transaction status
- `payment_intent.requires_action` - Update transaction status
- `payment_intent.requires_capture` - Update transaction status
- `payment_intent.created` - Update transaction status

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/payment-service
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Stripe keys, service URLs, AWS credentials, etc.
```

### 3. Start the Service

```bash
npm run dev  # Development mode
# or
npm start    # Production mode
```

The service will start on port **8006** (configurable via `PAYMENT_SERVICE_PORT`).

## 📝 Environment Variables Required

- `PAYMENT_SERVICE_PORT` - Port for the payment service (default: 8006)
- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key (must match other services)
- `FRONTEND_URL` - Frontend URL for CORS and redirects
- `API_GATEWAY_URL` - API Gateway URL for CORS
- `AUTH_SERVICE_URL` - Auth Service URL (default: http://localhost:8001)
- `WORKORDER_SERVICE_URL` - Workorder Service URL (default: http://localhost:8002)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_ONBOARDING_REFRESH_URL` - Stripe onboarding refresh URL
- `STRIPE_ONBOARDING_RETURN_URL` - Stripe onboarding return URL
- `PAYPAL_CLIENT_ID` - PayPal client ID (for future integration)
- `PAYPAL_CLIENT_SECRET` - PayPal client secret (for future integration)
- `PAYPAL_ENVIRONMENT` - PayPal environment (sandbox/production)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET_NAME` - S3 bucket name

## 🔄 Integration with Frontend

Update frontend API calls to use:
```
http://localhost:8006/api/v1/payment/*
http://localhost:8006/api/v1/wallet/*
```

## ⚠️ Important Notes

- The Payment Service uses **separate MongoDB database** (or collection during migration)
- **Stripe webhook** must be registered **BEFORE** `express.json` middleware
- All user data fetched/updated via **Auth Service HTTP calls**
- All workorder data fetched/updated via **Workorder Service HTTP calls**
- **PayPal integration** is placeholder - needs full implementation
- No direct model imports from other services
- The main backend still has wallet routes - they can be removed after migration is complete

## 🐛 Troubleshooting

### Service won't start
- Check if port 8006 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Stripe errors
- Verify `STRIPE_SECRET_KEY` is correct
- Check Stripe account status
- Verify webhook secret matches Stripe Dashboard
- Ensure webhook endpoint is registered before `express.json` middleware

### Auth Service connection fails
- Verify `AUTH_SERVICE_URL` is correct
- Ensure Auth Service is running on port 8001
- Check network connectivity
- Verify JWT token is valid

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings

## 📚 Next Steps

1. **Test the Payment Service**
   - Start the service
   - Test Stripe customer creation
   - Test payment intents
   - Test webhook handling

2. **Update Frontend**
   - Point payment API calls to Payment Service
   - Point wallet API calls to Payment Service
   - Test all payment flows in the frontend

3. **Set Up Stripe Webhook**
   - Configure webhook endpoint in Stripe Dashboard
   - Test webhook events
   - Verify transaction updates

4. **Implement PayPal Integration** (Future)
   - Complete PayPal service implementation
   - Add PayPal controllers
   - Add PayPal webhook handling

5. **Set Up API Gateway** (Future)
   - Configure routing: `/api/v1/payment/*` → Payment Service
   - Configure routing: `/api/v1/wallet/*` → Payment Service

## ✅ Migration Checklist

- [x] Create Payment Service structure
- [x] Extract Transaction model (remove cross-service refs)
- [x] Extract Wallet models (remove cross-service refs)
- [x] Create Auth Service client
- [x] Create Workorder Service client
- [x] Add Auth Service endpoints for Stripe/wallet/KYC updates
- [x] Extract payment controllers
- [x] Extract wallet controllers
- [x] Update controllers to use service clients
- [x] Set up routes with webhook
- [x] Create documentation
- [ ] Test all endpoints
- [ ] Test Stripe webhook
- [ ] Update frontend API calls
- [ ] Remove wallet routes from main backend
- [ ] Implement PayPal integration
- [ ] Set up separate database for Payment Service
