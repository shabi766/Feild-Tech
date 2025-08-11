import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

const TopupModal = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !stripe || !elements) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (paymentMethod === 'card') {
        // Create payment intent for card payment
        const { data: { clientSecret } } = await axios.post(
          `${WALLET_API_END_POINT}/topup`,
          { amountCents: Math.round(parseFloat(amount) * 100) },
          { withCredentials: true }
        );

        // Confirm payment
        const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        });

        if (stripeError) {
          setError(stripeError.message);
        } else {
          setSuccess('Payment successful! Funds added to your wallet.');
          setTimeout(() => {
            onSuccess();
            setAmount('');
            setSuccess('');
          }, 2000);
        }
      } else if (paymentMethod === 'bank_transfer') {
        // Handle bank transfer
        await axios.post(
          `${WALLET_API_END_POINT}/topup/bank-transfer`,
          { amountCents: Math.round(parseFloat(amount) * 100) },
          { withCredentials: true }
        );
        setSuccess('Bank transfer initiated! You will receive a confirmation email with transfer details.');
        setTimeout(() => {
          onSuccess();
          setAmount('');
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Funds to Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  <span>Credit Card</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Bank Transfer</span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountSelect(amt)}
                  className={`p-2 text-sm border rounded-md transition-colors ${
                    amount === amt.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter custom amount"
              required
            />
          </div>

          {/* Payment Details */}
          {paymentMethod === 'card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="border border-gray-300 rounded-md p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Bank Transfer Information</p>
                  <p className="mt-1">You will receive bank account details and transfer instructions via email after submitting this request.</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : `Add ${amount ? `$${amount}` : 'Funds'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrapper component to handle Stripe Elements
const TopupModalWrapper = ({ open, onClose, onSuccess }) => {
  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Stripe Not Configured</h3>
            <p className="text-gray-600 mb-4">
              Stripe payment processing is not configured. Please contact support or use bank transfer instead.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <TopupModal open={open} onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  );
};

export default TopupModalWrapper;
