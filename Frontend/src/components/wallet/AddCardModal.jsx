import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Inner = ({ onClose, onAdded }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createSetupIntent = async () => {
      const res = await axios.post(`${WALLET_API_END_POINT}/setup-intent`, {}, { withCredentials: true });
      setClientSecret(res.data?.clientSecret);
    };
    createSetupIntent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });
    setLoading(false);
    if (result.error) {
      alert(result.error.message);
      return;
    }
    onAdded?.();
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border rounded bg-white">
        <CardElement options={{ hidePostalCode: false }} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-gray-200">Cancel</button>
        <button type="submit" disabled={!stripe || loading || !clientSecret} className="px-3 py-2 rounded bg-primary text-white">
          {loading ? 'Saving…' : 'Save Card'}
        </button>
      </div>
    </form>
  );
};

const AddCardModal = ({ open, onClose, onAdded }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Add Payment Method</h3>
        <Elements stripe={stripePromise}>
          <Inner onClose={onClose} onAdded={onAdded} />
        </Elements>
      </div>
    </div>
  );
};

export default AddCardModal;


