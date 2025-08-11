import React, { useState } from 'react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

const WithdrawModal = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [bankAccount, setBankAccount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    // Validate based on withdrawal method
    if (withdrawalMethod === 'bank' && !bankAccount.trim()) {
      setError('Bank account details are required');
      return;
    }
    if (withdrawalMethod === 'paypal' && !paypalEmail.trim()) {
      setError('PayPal email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const withdrawalData = {
        amountCents: Math.round(parseFloat(amount) * 100),
        method: withdrawalMethod
      };

      if (withdrawalMethod === 'bank') {
        withdrawalData.bankAccount = bankAccount;
      } else if (withdrawalMethod === 'paypal') {
        withdrawalData.paypalEmail = paypalEmail;
      }

      await axios.post(
        `${WALLET_API_END_POINT}/withdraw`,
        withdrawalData,
        { withCredentials: true }
      );

      setSuccess('Withdrawal request submitted successfully! You will receive a confirmation email.');
      setTimeout(() => {
        onSuccess();
        setAmount('');
        setBankAccount('');
        setPaypalEmail('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Withdraw Funds</h3>
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
          {/* Withdrawal Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWithdrawalMethod('bank')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  withdrawalMethod === 'bank'
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
              <button
                type="button"
                onClick={() => setWithdrawalMethod('paypal')}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  withdrawalMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>PayPal</span>
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

          {/* Method-specific Fields */}
          {withdrawalMethod === 'bank' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Details *
              </label>
              <textarea
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide: Bank name, Account holder name, Account number, Routing number (if applicable)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include all necessary banking information for the transfer
              </p>
            </div>
          )}

          {withdrawalMethod === 'paypal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayPal Email *
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure this email is associated with your PayPal account
              </p>
            </div>
          )}

          {/* Processing Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Processing Time</p>
                <p className="mt-1">
                  {withdrawalMethod === 'bank' 
                    ? 'Bank transfers typically take 2-5 business days to complete.'
                    : 'PayPal transfers are usually completed within 24 hours.'
                  }
                </p>
              </div>
            </div>
          </div>

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
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : `Withdraw ${amount ? `$${amount}` : 'Funds'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
