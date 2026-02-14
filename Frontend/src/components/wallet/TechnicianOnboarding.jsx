import React, { useState } from 'react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

const TechnicianOnboarding = ({ account }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    accountId: account?.accountId || null,
    chargesEnabled: account?.chargesEnabled || false,
    detailsSubmitted: account?.detailsSubmitted || false,
  });

  const handleCreateOrFetchAccount = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${WALLET_API_END_POINT}/connect`, {}, { withCredentials: true });
      if (res.data?.success) {
        setStatus({
          accountId: res.data.accountId,
          chargesEnabled: !!res.data.chargesEnabled,
          detailsSubmitted: !!res.data.detailsSubmitted,
        });
      } else {
        alert(res.data?.message || 'Failed to create connect account');
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${WALLET_API_END_POINT}/connect/onboarding-link`, {}, { withCredentials: true });
      const url = res.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        alert('Could not create onboarding link');
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed creating onboarding link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="font-semibold text-gray-900">Payout Account</h3>
        <p className="text-sm text-gray-600">Create and verify your Stripe Connect account to receive payments.</p>
        <div className="mt-3 text-sm">
          <div>Account ID: <span className="font-mono">{status.accountId || '—'}</span></div>
          <div>Charges Enabled: <span className="font-medium">{status.chargesEnabled ? 'Yes' : 'No'}</span></div>
          <div>Details Submitted: <span className="font-medium">{status.detailsSubmitted ? 'Yes' : 'No'}</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCreateOrFetchAccount}
            disabled={loading}
            className="px-3 py-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {status.accountId ? 'Refresh Status' : 'Create Account'}
          </button>
          <button
            onClick={handleOnboarding}
            disabled={loading || !status.accountId}
            className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianOnboarding;


