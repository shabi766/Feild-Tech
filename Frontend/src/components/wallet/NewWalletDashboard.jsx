import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PasscodeEntry from './PasscodeEntry';
import { 
    Wallet, 
    CreditCard, 
    ArrowUpDown, 
    History, 
    Plus, 
    Minus,
    DollarSign,
    Building2,
    User,
    Lock
} from 'lucide-react';

const NewWalletDashboard = () => {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [selectedWallet, setSelectedWallet] = useState('');
    const [targetWallet, setTargetWallet] = useState('');
    const [walletAccessGranted, setWalletAccessGranted] = useState(false);

    useEffect(() => {
        fetchWalletOverview();
    }, []);

    const fetchWalletOverview = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/new-wallet/overview', {
                withCredentials: true
            });
            setWalletData(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching wallet overview:', err);
            setError(err.response?.data?.message || 'Failed to fetch wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        try {
            if (!selectedWallet || !topUpAmount || topUpAmount <= 0) {
                alert('Please select a wallet and enter a valid amount');
                return;
            }

            const response = await axios.post('/api/v1/new-wallet/topup', {
                walletId: selectedWallet,
                amount: parseFloat(topUpAmount),
                paymentMethod: 'ADMIN',
                notes: 'Manual top-up'
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                alert('Wallet topped up successfully!');
                setShowTopUpModal(false);
                setTopUpAmount('');
                setSelectedWallet('');
                fetchWalletOverview();
            }
        } catch (err) {
            console.error('Error topping up wallet:', err);
            alert(err.response?.data?.message || 'Failed to top up wallet');
        }
    };

    const handleTransfer = async () => {
        try {
            if (!selectedWallet || !targetWallet || !transferAmount || transferAmount <= 0) {
                alert('Please select wallets and enter a valid amount');
                return;
            }

            const response = await axios.post('/api/v1/new-wallet/transfer', {
                fromWalletId: selectedWallet,
                toWalletId: targetWallet,
                amount: parseFloat(transferAmount),
                description: 'Fund transfer'
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                alert('Transfer completed successfully!');
                setShowTransferModal(false);
                setTransferAmount('');
                setSelectedWallet('');
                setTargetWallet('');
                fetchWalletOverview();
            }
        } catch (err) {
            console.error('Error transferring funds:', err);
            alert(err.response?.data?.message || 'Failed to transfer funds');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading wallet data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!walletData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">No wallet data available</div>
            </div>
        );
    }

    // If wallet access not granted, show passcode entry
    if (!walletAccessGranted) {
        return (
            <PasscodeEntry 
                onSuccess={() => setWalletAccessGranted(true)}
                onCancel={() => setShowPasscodeModal(false)}
                walletName="Digital Wallet"
            />
        );
    }

    const { user, wallets, companyWallet, transactions } = walletData;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Wallet Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Welcome back, {user.fullname} ({user.role})
                                {user.companyId && companyWallet && (
                                    <span className="ml-2 text-blue-600">
                                        • Company: {companyWallet.userRole}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => setWalletAccessGranted(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Lock className="w-4 h-4" />
                            Lock Wallet
                        </button>
                    </div>
                </div>

                {/* Wallet Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Individual Wallet */}
                    {wallets.find(w => w.walletType === 'INDIVIDUAL') && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <User className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Individual Wallet
                                        </h3>
                                        <p className="text-sm text-gray-500">Personal funds</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                ${wallets.find(w => w.walletType === 'INDIVIDUAL')?.balance?.toFixed(2) || '0.00'}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSelectedWallet(wallets.find(w => w.walletType === 'INDIVIDUAL')?._id);
                                        setShowTopUpModal(true);
                                    }}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Top Up
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Company Wallet */}
                    {companyWallet && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Building2 className="h-8 w-8 text-green-500 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Company Wallet
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {companyWallet.canManage ? 'Full Access' : 'View Only'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                ${companyWallet.balance?.toFixed(2) || '0.00'}
                            </div>
                            {companyWallet.canManage && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedWallet(companyWallet._id);
                                            setShowTopUpModal(true);
                                        }}
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Funds
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub Wallet */}
                    {wallets.find(w => w.walletType === 'COMPANY_SUB') && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Wallet className="h-8 w-8 text-purple-500 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Company Sub-Wallet
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {wallets.find(w => w.walletType === 'COMPANY_SUB')?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                ${wallets.find(w => w.walletType === 'COMPANY_SUB')?.balance?.toFixed(2) || '0.00'}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSelectedWallet(wallets.find(w => w.walletType === 'COMPANY_SUB')?._id);
                                        setShowTransferModal(true);
                                    }}
                                    className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
                                >
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    Transfer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setShowTopUpModal(true)}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <Plus className="h-6 w-6 text-blue-500 mr-2" />
                            <span className="text-blue-600 font-medium">Top Up Wallet</span>
                        </button>
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                        >
                            <ArrowUpDown className="h-6 w-6 text-green-500 mr-2" />
                            <span className="text-green-600 font-medium">Transfer Funds</span>
                        </button>
                        <button
                            onClick={fetchWalletOverview}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                        >
                            <History className="h-6 w-6 text-purple-500 mr-2" />
                            <span className="text-purple-600 font-medium">View History</span>
                        </button>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
                    {transactions && transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            transaction.type === 'TOPUP' ? 'bg-green-500' :
                                            transaction.type === 'TRANSFER' ? 'bg-blue-500' :
                                            transaction.type === 'PAYMENT' ? 'bg-purple-500' :
                                            'bg-gray-500'
                                        }`} />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {transaction.description || transaction.type}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${
                                            transaction.type === 'TOPUP' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'TOPUP' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {transaction.status.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No transactions yet</p>
                    )}
                </div>
            </div>

            {/* Top Up Modal */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Top Up Wallet</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleTopUp}
                                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Top Up
                                </button>
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Transfer Funds</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Wallet
                                </label>
                                <select
                                    value={selectedWallet}
                                    onChange={(e) => setSelectedWallet(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select source wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet._id} value={wallet._id}>
                                            {wallet.walletType === 'INDIVIDUAL' ? 'Individual Wallet' : wallet.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Wallet
                                </label>
                                <select
                                    value={targetWallet}
                                    onChange={(e) => setTargetWallet(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select destination wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet._id} value={wallet._id}>
                                            {wallet.walletType === 'INDIVIDUAL' ? 'Individual Wallet' : wallet.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleTransfer}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Transfer
                                </button>
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewWalletDashboard;
