import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { 
    Lock, Eye, EyeOff, Shield, KeyRound, Smartphone, 
    Fingerprint, AlertCircle, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const PasscodeEntry = ({ onSuccess, onCancel, walletName = "Wallet" }) => {
    const [passcode, setPasscode] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [locked, setLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);

    const MAX_ATTEMPTS = 3;
    const LOCK_DURATION = 300; // 5 minutes in seconds

    useEffect(() => {
        let interval;
        if (locked && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer(prev => {
                    if (prev <= 1) {
                        setLocked(false);
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [locked, lockTimer]);

    const handlePasscodeChange = (e) => {
        const value = e.target.value;
        if (value.length <= 6 && /^\d*$/.test(value)) {
            setPasscode(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passcode.length !== 6) {
            setError('Please enter a 6-digit passcode');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const res = await axios.post('/api/v1/wallet-passcode/verify', {
                passcode: passcode
            }, { withCredentials: true });
            
            if (res.data?.success) {
                toast.success('Passcode verified successfully!');
                onSuccess();
            } else {
                // Handle specific error cases from API
                const data = res.data?.data;
                if (data?.locked) {
                    setLocked(true);
                    setLockTimer(data.remainingTime || LOCK_DURATION);
                    setError(`Too many failed attempts. Wallet locked for ${Math.floor(LOCK_DURATION / 60)} minutes.`);
                } else {
                    handleFailedAttempt();
                }
            }
            
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.data?.locked) {
                // Handle locked wallet from API
                const data = err.response.data.data;
                setLocked(true);
                setLockTimer(data.remainingTime || LOCK_DURATION);
                setError(`Too many failed attempts. Wallet locked for ${Math.floor(LOCK_DURATION / 60)} minutes.`);
            } else {
                toast.error('Failed to verify passcode. Please try again.');
                handleFailedAttempt();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFailedAttempt = () => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
            setLocked(true);
            setLockTimer(LOCK_DURATION);
            setError(`Too many failed attempts. Wallet locked for ${Math.floor(LOCK_DURATION / 60)} minutes.`);
        } else {
            setError(`Incorrect passcode. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            setPasscode('');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (locked) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4"
            >
                <div className="w-full max-w-md text-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Wallet Temporarily Locked</h1>
                    <p className="text-gray-600 mb-6">
                        Too many failed passcode attempts. Your wallet is locked for security.
                    </p>
                    
                    <div className="bg-red-50 rounded-lg p-6 mb-6">
                        <div className="text-4xl font-mono font-bold text-red-600 mb-2">
                            {formatTime(lockTimer)}
                        </div>
                        <p className="text-sm text-red-700">
                            Time remaining before you can try again
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                            <strong>Security Tip:</strong> Make sure you're entering the correct 6-digit passcode 
                            you set up during wallet creation.
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <KeyRound className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Your Wallet</h1>
                    <p className="text-gray-600">Enter your 6-digit passcode to continue</p>
                </div>

                {/* Passcode Entry Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{walletName}</h2>
                        <p className="text-sm text-gray-600">
                            Secure access with your personal passcode
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Passcode Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Enter 6-Digit Passcode
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type={showPasscode ? "text" : "password"}
                                    value={passcode}
                                    onChange={handlePasscodeChange}
                                    placeholder="000000"
                                    maxLength={6}
                                    className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest font-mono ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasscode(!showPasscode)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            
                            {/* Attempts Counter */}
                            {attempts > 0 && (
                                <div className="text-sm text-gray-500 mt-1">
                                    Failed attempts: {attempts}/{MAX_ATTEMPTS}
                                </div>
                            )}
                        </div>

                        {/* Security Notice */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Security Notice:</p>
                                    <p className="text-blue-700">
                                        Your wallet will be temporarily locked after {MAX_ATTEMPTS} failed attempts 
                                        to protect your funds.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1 h-12"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            
                            <Button 
                                type="submit" 
                                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" 
                                disabled={loading || passcode.length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Fingerprint className="mr-2 h-5 w-5" />
                                        Access Wallet
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Help Section */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">Need help?</p>
                            <div className="flex justify-center space-x-4 text-xs">
                                <button className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Forgot Passcode?
                                </button>
                                <button className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Info */}
                <div className="mt-6 text-center">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Demo Mode:</strong> Use passcode <code className="bg-yellow-100 px-2 py-1 rounded">123456</code> to access the wallet
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasscodeEntry;
