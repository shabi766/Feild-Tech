import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { WALLET_API_END_POINT } from '@/components/utils/constant';
import TopupModal from './TopupModal';
import WithdrawModal from './WithdrawModal';
import KYCForm from './KYCForm';
import KYCStatusBanner from './KYCStatusBanner';

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const WalletDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;
  const [overview, setOverview] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${WALLET_API_END_POINT}/overview`, { withCredentials: true });
      if (res.data?.success) setOverview(res.data.overview);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCStatus = async () => {
    try {
      const res = await axios.get(`${WALLET_API_END_POINT}/kyc`, { withCredentials: true });
      if (res.data?.success) {
        setKycStatus(res.data.kyc?.kycStatus || 'unverified');
      }
    } catch (err) {
      console.error('Failed to fetch KYC status:', err);
    }
  };

  useEffect(() => { 
    fetchOverview(); 
    fetchKYCStatus();
  }, []);

  const totalBalance = useMemo(() => {
    // Show wallet balance from overview
    return Number(overview?.walletBalance || 0);
  }, [overview]);

  const techAvailableCents = useMemo(() => {
    const bal = overview?.technician?.balance;
    const usd = (bal?.available || []).find(b => b.currency === 'usd')?.amount || 0;
    return usd;
  }, [overview]);

  // Show KYC form if not verified
  if (kycStatus === 'unverified' || kycStatus === 'pending') {
    return (
      <div className="rounded-2xl overflow-hidden border shadow-sm">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Wallet Access</h2>
              <p className="text-slate-300 text-sm mt-1">Complete KYC verification to access your wallet</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6">
          <KYCForm />
        </div>
      </div>
    );
  }

  // Show wallet dashboard if KYC is verified
  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100 p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">Wallet</h2>
            <p className="text-slate-300 text-sm mt-1">Secure balance and transactions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchOverview(); fetchKYCStatus(); }} className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20">Refresh</button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-slate-300 text-xs">Total Balance</div>
            <div className="text-2xl font-semibold mt-1">{formatCurrency(totalBalance, 'USD')}</div>
          </div>
          {role === 'Technician' && (
            <>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-slate-300 text-xs">Stripe Available (USD)</div>
                <div className="text-2xl font-semibold mt-1">{formatCurrency(techAvailableCents / 100, 'USD')}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-slate-300 text-xs">Payouts</div>
                <div className="text-sm mt-1">Enabled: {overview?.technician?.account?.payouts_enabled ? 'Yes' : 'No'}</div>
              </div>
            </>
          )}
          {(role === 'Recruiter' || role === 'Admin') && (
            <>
              <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
                <div className="text-slate-300 text-xs">Default Payment Methods</div>
                <div className="text-sm mt-1">{overview?.recruiter?.paymentMethods?.length || 0} saved</div>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setTopupOpen(true)} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">Add Amount</button>
          {role === 'Technician' && (
            <button onClick={() => setWithdrawOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white">Withdraw</button>
          )}
        </div>
        {loading && <div className="text-xs text-slate-300 mt-3">Loading…</div>}
        {error && <div className="text-xs text-red-300 mt-3">{error}</div>}
      </div>

      <div className="bg-white p-4 md:p-6">
        {/* KYC Status Banner */}
        <KYCStatusBanner 
          status={kycStatus} 
          onRefresh={() => { fetchOverview(); fetchKYCStatus(); }} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-semibold mb-2">Wallet Balance</h4>
            <div className="border rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalBalance, 'USD')}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Available for transactions
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Job Transactions</h4>
            <div className="border rounded-lg divide-y">
              {(overview?.recruiter?.transactions || overview?.technician?.transactions || []).length === 0 && (
                <div className="p-3 text-sm text-gray-500">No job transactions</div>
              )}
              {(overview?.recruiter?.transactions || overview?.technician?.transactions || []).map((t) => (
                <div key={t._id} className="p-3 text-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.status}</div>
                    <div className="text-gray-600">WO: {t.workorder}</div>
                  </div>
                  <div className="font-mono">${(t.amountCents/100).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TopupModal open={topupOpen} onClose={() => setTopupOpen(false)} onSuccess={() => { setTopupOpen(false); fetchOverview(); }} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} onSuccess={() => { setWithdrawOpen(false); fetchOverview(); }} />
    </div>
  );
};

export default WalletDashboard;


