# Payment Service

Payment processing microservice for ShiftMate. Handles Stripe payments, wallet operations, and KYC verification.

## Features

- **Stripe Integration**
  - Customer creation and management
  - Connect accounts for technicians (payouts)
  - Payment intents for job payments
  - Checkout sessions
  - Payment methods management
  - Webhook handling

- **Wallet Management**
  - Wallet overview
  - Top-up functionality
  - Withdrawal to bank accounts
  - Transaction history

- **KYC Verification**
  - Document submission
  - KYC status tracking

- **PayPal Integration** (Placeholder - Future)
  - Order creation
  - Payment capture
  - Webhook handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret key (must match other services)
   - Stripe API keys and webhook secret
   - Service URLs (Auth, Workorder)
   - AWS S3 credentials (for KYC documents)

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 8006 by default (configurable via `PAYMENT_SERVICE_PORT`).

## API Endpoints

### Payment Endpoints

**Stripe Customer:**
- `POST /api/v1/payment/customer` - Create or get Stripe customer

**Stripe Connect (Technicians):**
- `POST /api/v1/payment/connect` - Create or get Connect account
- `POST /api/v1/payment/connect/onboarding-link` - Get onboarding link
- `GET /api/v1/payment/connect/account` - Get Connect account info
- `GET /api/v1/payment/connect/balance` - Get Connect account balance

**Payments:**
- `POST /api/v1/payment/pay/:workorderId` - Create payment intent for job
- `POST /api/v1/payment/checkout/:workorderId` - Create checkout session
- `GET /api/v1/payment/transactions` - List transactions
- `GET /api/v1/payment/customer` - Get customer info

**Payment Methods:**
- `POST /api/v1/payment/setup-intent` - Create setup intent
- `GET /api/v1/payment/payment-methods` - List payment methods
- `DELETE /api/v1/payment/payment-methods/:pmId` - Remove payment method

**Webhook:**
- `POST /api/v1/payment/webhook` - Stripe webhook endpoint

### Wallet Endpoints

- `GET /api/v1/wallet/overview` - Get wallet overview
- `GET /api/v1/wallet/kyc` - Get KYC status
- `POST /api/v1/wallet/kyc` - Submit KYC documents
- `POST /api/v1/wallet/topup` - Top up wallet
- `POST /api/v1/wallet/withdraw` - Withdraw funds

### Health Check

- `GET /health` - Service health check

## Database

The Payment Service uses its own MongoDB database (or collection during migration).
Models store IDs only (no MongoDB refs) for cross-service references.

## Model Structure

- **Transaction**: Payment transactions with Stripe/PayPal references
- **Wallet**: Wallet structure (individual, company main, company sub)
- **WalletTransaction**: Wallet transaction history

## Integration with Other Services

### Auth Service
- Fetches user data
- Updates user Stripe data (customerId, connectAccountId)
- Updates user wallet balance
- Updates user KYC data

### Workorder Service
- Fetches workorder data
- Updates workorder payment status

## Stripe Webhook Setup

1. Configure webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/v1/payment/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.

2. Set `STRIPE_WEBHOOK_SECRET` in `.env` (from Stripe Dashboard)

3. The webhook endpoint uses `express.raw` middleware to verify signatures

## Environment Variables

See `.env.example` for all required environment variables.

## Troubleshooting

### Service won't start
- Check if port 8006 is available
- Verify MongoDB is running
- Check environment variables are set correctly

### Stripe errors
- Verify `STRIPE_SECRET_KEY` is correct
- Check Stripe account status
- Verify webhook secret matches Stripe Dashboard

### Auth Service connection fails
- Verify `AUTH_SERVICE_URL` is correct
- Ensure Auth Service is running on port 8001
- Check network connectivity

### Database connection fails
- Verify `MONGO_URI` is correct
- Ensure MongoDB is accessible
- Check network/firewall settings

## Migration Notes

- All user data fetched via Auth Service HTTP calls
- All workorder data fetched via Workorder Service HTTP calls
- No direct model imports from other services
- Stripe webhook must be registered before `express.json` middleware
