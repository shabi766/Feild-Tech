import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

const formatMoney = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency?.toUpperCase() || ''}`;
  }
};

const TechnicianWalletOverview = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [acctRes, balRes] = await Promise.all([
        axios.get(`${WALLET_API_END_POINT}/connect/account`, { withCredentials: true }),
        axios.get(`${WALLET_API_END_POINT}/connect/balance`, { withCredentials: true }),
      ]);
      if (acctRes.data?.success) setAccount(acctRes.data.account);
      if (balRes.data?.success) setBalance(balRes.data.balance);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to fetch wallet info';
      setError(errorMessage);
      
      // If Stripe is not configured, show a helpful message
      if (err?.response?.status === 503) {
        setError('Payment processing is not configured. Please contact support to enable wallet features.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Payout Account Overview</h3>
          <button onClick={fetchData} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Refresh</button>
        </div>
        {loading && <div className="text-sm text-gray-500 mt-2">Loading…</div>}
        {error && (
          <div className="text-sm text-red-600 mt-2">
            {error}
            {error.includes('not configured') && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                <p>To enable wallet features, the system administrator needs to configure Stripe payment processing.</p>
                <p className="mt-1">Please contact support or your system administrator.</p>
              </div>
            )}
          </div>
        )}
        {account ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div>Account ID: <span className="font-mono">{account.id}</span></div>
              <div>Charges Enabled: <span className="font-medium">{account.charges_enabled ? 'Yes' : 'No'}</span></div>
              <div>Payouts Enabled: <span className="font-medium">{account.payouts_enabled ? 'Yes' : 'No'}</span></div>
              <div>Details Submitted: <span className="font-medium">{account.details_submitted ? 'Yes' : 'No'}</span></div>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">Requirements</div>
              {account.requirements ? (
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {account.requirements.currently_due?.length > 0 ? account.requirements.currently_due.map((r) => (
                    <li key={r}>{r}</li>
                  )) : <li className="text-gray-500">No items currently due</li>}
                </ul>
              ) : (
                <div className="text-gray-500">Not available</div>
              )}
            </div>
            <div className="md:col-span-2">
              <div className="font-medium text-gray-800 mb-1">External Accounts</div>
              <div className="space-y-2">
                {account.external_accounts?.length > 0 ? account.external_accounts.map((ea) => (
                  <div key={ea.id} className="p-2 border rounded">
                    <div className="flex items-center justify-between">
                      <div>{ea.bank_name || 'Bank'} •••• {ea.last4 || ''}</div>
                      <div className="text-xs text-gray-600">{ea.currency?.toUpperCase()}</div>
                    </div>
                  </div>
                )) : <div className="text-gray-500 text-sm">No bank accounts added yet. Complete onboarding to add one.</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 mt-2">No payout account found. Use the onboarding above to create it.</div>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-white">
        <h4 className="font-semibold text-gray-900">Balance</h4>
        {balance ? (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded bg-gray-50">
              <div className="text-xs text-gray-600">Available</div>
              <div className="mt-1 space-y-1">
                {balance.available?.length > 0 ? balance.available.map((b, i) => (
                  <div key={i} className="text-sm">{formatMoney(b.amount, b.currency)}</div>
                )) : <div className="text-sm text-gray-500">—</div>}
              </div>
            </div>
            <div className="p-3 border rounded bg-gray-50">
              <div className="text-xs text-gray-600">Pending</div>
              <div className="mt-1 space-y-1">
                {balance.pending?.length > 0 ? balance.pending.map((b, i) => (
                  <div key={i} className="text-sm">{formatMoney(b.amount, b.currency)}</div>
                )) : <div className="text-sm text-gray-500">—</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 mt-2">No balance available.</div>
        )}
      </div>

      <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
        <h4 className="font-semibold text-amber-900">Payout schedule</h4>
        <p className="text-sm text-amber-800 mt-1">
          Payouts are handled by Stripe based on your Connect account settings and region. Once your account is verified and payouts are enabled, funds will be transferred to your linked bank account automatically per the schedule configured in Stripe.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          To change payout schedule or add a bank account, return to the onboarding link and complete/update your details.
        </p>
      </div>
    </div>
  );
};

export default TechnicianWalletOverview;


