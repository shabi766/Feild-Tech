import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';
import AddCardModal from './AddCardModal';

const RecruiterWallet = () => {
  const [customerId, setCustomerId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addCardOpen, setAddCardOpen] = useState(false);

  const ensureCustomer = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${WALLET_API_END_POINT}/customer`, {}, { withCredentials: true });
      if (res.data?.success) setCustomerId(res.data.customerId);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed creating customer');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${WALLET_API_END_POINT}/transactions`, { withCredentials: true });
      if (res.data?.success) setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomerInfo = async () => {
    try {
      const res = await axios.get(`${WALLET_API_END_POINT}/customer`, { withCredentials: true });
      if (res.data?.success) setCustomerInfo(res.data.customer);
    } catch (err) {
      // ignore when not created yet
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get(`${WALLET_API_END_POINT}/payment-methods`, { withCredentials: true });
      if (res.data?.success) setPaymentMethods(res.data.paymentMethods || []);
    } catch (err) {
      // ignore when not created yet
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCustomerInfo();
    fetchPaymentMethods();
  }, []);

  return (
    <div className="space-y-4">
      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} onAdded={() => { fetchPaymentMethods(); }} />
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="font-semibold text-gray-900">Recruiter Wallet</h3>
        <p className="text-sm text-gray-600">Create a Stripe customer to save payment methods and pay technicians.</p>
        <div className="mt-2 text-sm space-y-1">
          <div>Customer ID: <span className="font-mono">{customerId || customerInfo?.id || '—'}</span></div>
          {customerInfo && (
            <div className="text-xs text-gray-600">
              <div>Name: {customerInfo.name || '—'}</div>
              <div>Email: {customerInfo.email || '—'}</div>
              <div>Phone: {customerInfo.phone || '—'}</div>
              <div>Address: {customerInfo.address ? `${customerInfo.address.line1 || ''} ${customerInfo.address.city || ''}` : '—'}</div>
            </div>
          )}
        </div>
        <div className="mt-3">
          <button
            onClick={ensureCustomer}
            disabled={loading}
            className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {customerId ? 'Refresh' : 'Create Customer'}
          </button>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-white">
        <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
        <div className="space-y-2">
          {paymentMethods.length === 0 && <div className="text-sm text-gray-500">No saved cards yet.</div>}
          {paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center justify-between text-sm p-2 border rounded">
              <div>{pm.brand?.toUpperCase()} •••• {pm.last4} — exp {pm.exp_month}/{pm.exp_year}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button onClick={() => setAddCardOpen(true)} className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Add Card</button>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-white">
        <h4 className="font-semibold text-gray-900 mb-2">Recent Transactions</h4>
        <div className="divide-y">
          {transactions.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
          {transactions.map((t) => (
            <div key={t._id} className="py-2 text-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{t.status}</div>
                <div className="text-gray-600">Workorder: {t.workorder}</div>
              </div>
              <div className="font-mono">${'{'}(t.amountCents/100).toFixed(2){'}'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterWallet;


