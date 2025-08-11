# Paymob Integration for Pakistan Market

This document explains how to set up and use Paymob payment gateway integration for the Pakistan market while keeping Stripe for the UAE market.

## Overview

The system now supports dual payment gateways:
- **Stripe**: For UAE market (AE)
- **Paymob**: For Pakistan market (PK)

## Backend Setup

### 1. Environment Variables

Add these environment variables to your `.env` file:

```bash
# Paymob Configuration (Pakistan)
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_paymob_integration_id
PAYMOB_IFRAME_ID=your_paymob_iframe_id
PAYMOB_HMAC_SECRET=your_paymob_hmac_secret

# Market Configuration
DEFAULT_MARKET=uae
```

### 2. Dependencies

Make sure you have axios installed:

```bash
npm install axios
```

### 3. Files Created/Modified

#### New Files:
- `Backend/utils/paymob.js` - Paymob service utility
- `Backend/utils/marketDetector.js` - Market detection utility
- `Frontend/src/components/wallet/PaymobPayment.jsx` - Paymob payment component

#### Modified Files:
- `Backend/Controllers/wallet.controller.js` - Added Paymob support
- `Backend/Routes/wallet.route.js` - Added Paymob webhook route
- `Backend/Models/user.model.js` - Added market and country code fields
- `Frontend/src/components/wallet/TopupModal.jsx` - Added gateway detection

## Frontend Setup

### 1. Dependencies

Make sure you have the required UI components:

```bash
npm install @radix-ui/react-select
```

### 2. Usage

The system automatically detects the user's market based on:
1. Explicit user preference (`user.market`)
2. Country code (`user.countryCode`)
3. Phone number prefix
4. Default market setting

## How It Works

### 1. Market Detection

The system automatically detects which payment gateway to use:

```javascript
// UAE users (AE) → Stripe
// Pakistan users (PK) → Paymob
const userMarket = getUserMarket(user);
const paymentGateway = getUserPaymentGateway(user);
```

### 2. Payment Flow

#### Stripe (UAE):
1. User initiates top-up
2. System creates Stripe PaymentIntent
3. User completes payment with Stripe Elements
4. Webhook updates wallet balance

#### Paymob (Pakistan):
1. User initiates top-up
2. System creates Paymob order and payment key
3. User completes payment via Paymob iframe/form
4. Webhook updates wallet balance

### 3. Webhook Handling

Both payment gateways have webhook endpoints:
- Stripe: `/api/wallet/webhook/stripe` (mounted in main server)
- Paymob: `/api/wallet/webhook/paymob`

## Paymob Configuration

### 1. Get API Credentials

1. Sign up at [Paymob](https://paymob.com/)
2. Get your API key from the dashboard
3. Create an integration
4. Get your iframe ID
5. Set up HMAC secret for webhook verification

### 2. Webhook URL

Set your webhook URL in Paymob dashboard:
```
https://your-domain.com/api/wallet/webhook/paymob
```

### 3. Supported Payment Methods

Paymob supports:
- Credit/Debit Cards
- Bank Transfers
- Mobile Wallets
- Cash on Delivery

## Testing

### 1. Stripe Test Mode

Use Stripe test cards for UAE testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### 2. Paymob Test Mode

Use Paymob test credentials for Pakistan testing:
- Test API key from dashboard
- Test integration ID
- Test iframe ID

## Security Features

### 1. HMAC Verification

Paymob webhooks are verified using HMAC signatures:

```javascript
const verifiedData = await paymobService.processCallback(hmac, data);
```

### 2. Market Isolation

Users can only use payment gateways appropriate for their market:
- UAE users cannot use Paymob
- Pakistan users cannot use Stripe

### 3. Secure PIN

Wallet operations require a 4-6 digit PIN set during KYC.

## Error Handling

### 1. Gateway Unavailable

If a payment gateway is not configured:

```javascript
if (!stripe && paymentGateway === 'stripe') {
  return res.status(500).json({ 
    success: false, 
    message: "Stripe not configured for this market" 
  });
}
```

### 2. Market Mismatch

If user tries to use wrong gateway:

```javascript
if (userMarket === MARKETS.UAE && paymentGateway === 'paymob') {
  return res.status(400).json({ 
    success: false, 
    message: "Paymob not available for UAE market" 
  });
}
```

## Monitoring

### 1. Logs

Monitor payment flows in your application logs:
- Payment initiation
- Webhook processing
- Error handling

### 2. Dashboard

Use Paymob dashboard to monitor:
- Transaction status
- Payment methods
- Success/failure rates

## Troubleshooting

### 1. Common Issues

- **HMAC verification failed**: Check `PAYMOB_HMAC_SECRET`
- **API key invalid**: Verify `PAYMOB_API_KEY`
- **Integration not found**: Check `PAYMOB_INTEGRATION_ID`

### 2. Debug Mode

Enable debug logging:

```javascript
console.log('Paymob payment data:', data);
console.log('User market:', userMarket);
console.log('Payment gateway:', paymentGateway);
```

## Future Enhancements

### 1. Additional Markets

Support for more markets:
- India (Razorpay)
- Europe (Adyen)
- US (Stripe)

### 2. Payment Methods

Expand payment options:
- Cryptocurrency
- Buy Now Pay Later
- Installments

### 3. Analytics

Payment analytics dashboard:
- Success rates by market
- Payment method preferences
- Revenue tracking

## Support

For Paymob-specific issues:
- [Paymob Documentation](https://docs.paymob.com/)
- [Paymob Support](https://paymob.com/support)

For system integration issues:
- Check application logs
- Verify environment variables
- Test webhook endpoints
