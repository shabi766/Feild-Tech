import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { 
    Loader2, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle,
    KeyRound, Fingerprint, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

const PasscodeSetup = ({ onComplete }) => {
    const { user } = useSelector((s) => s.auth);
    const [loading, setLoading] = useState(false);
    const [showPasscode, setShowPasscode] = useState(false);
    const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);
    const [form, setForm] = useState({
        passcode: '',
        confirmPasscode: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Passcode validation
        if (!form.passcode) {
            newErrors.passcode = 'Passcode is required';
        } else if (form.passcode.length !== 6) {
            newErrors.passcode = 'Passcode must be exactly 6 digits';
        } else if (!/^\d+$/.test(form.passcode)) {
            newErrors.passcode = 'Passcode must contain only numbers';
        }

        // Confirm passcode validation
        if (!form.confirmPasscode) {
            newErrors.confirmPasscode = 'Please confirm your passcode';
        } else if (form.passcode !== form.confirmPasscode) {
            newErrors.confirmPasscode = 'Passcodes do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        try {
            setLoading(true);
            
            const res = await axios.post('/api/v1/wallet-passcode/create', {
                passcode: form.passcode
            }, { withCredentials: true });
            
            if (res.data?.success) {
                toast.success('Passcode set successfully! You can now access your wallet.');
                onComplete('passcode_set');
            } else {
                toast.error(res.data?.message || 'Failed to set passcode');
            }
            
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to set passcode');
        } finally {
            setLoading(false);
        }
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Approved! 🎉</h1>
                    <p className="text-gray-600">Set up your wallet passcode to start using your wallet</p>
                </div>

                {/* Passcode Setup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Passcode</h2>
                        <p className="text-sm text-gray-600">
                            Create a 6-digit passcode to secure your wallet access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Passcode */}
                        <div className="space-y-2">
                            <Label htmlFor="passcode" className="text-sm font-medium text-gray-700">
                                Enter 6-Digit Passcode
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="passcode"
                                    type={showPasscode ? "text" : "password"}
                                    name="passcode"
                                    value={form.passcode}
                                    onChange={handleInputChange}
                                    placeholder="000000"
                                    maxLength={6}
                                    className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest ${errors.passcode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasscode(!showPasscode)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <ErrorMessage error={errors.passcode} />
                        </div>

                        {/* Confirm Passcode */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPasscode" className="text-sm font-medium text-gray-700">
                                Confirm Passcode
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="confirmPasscode"
                                    type={showConfirmPasscode ? "text" : "password"}
                                    name="confirmPasscode"
                                    value={form.confirmPasscode}
                                    onChange={handleInputChange}
                                    placeholder="000000"
                                    maxLength={6}
                                    className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest ${errors.confirmPasscode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <ErrorMessage error={errors.confirmPasscode} />
                        </div>

                        {/* Security Tips */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-2">Security Tips:</p>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• Use a passcode you can remember easily</li>
                                        <li>• Don't share your passcode with anyone</li>
                                        <li>• Avoid using obvious patterns like 123456</li>
                                        <li>• You'll need this passcode every time you access your wallet</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Setting Passcode...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Set Passcode & Access Wallet
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            By setting up your passcode, you agree to our{' '}
                            <a href="#" className="text-blue-600 hover:underline">Wallet Terms of Service</a>
                        </p>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Smartphone className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Secure Access</h3>
                        <p className="text-xs text-gray-600">Access your wallet with your unique passcode</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Fingerprint className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Quick Transactions</h3>
                        <p className="text-xs text-gray-600">Send and receive money instantly</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Safe & Secure</h3>
                        <p className="text-xs text-gray-600">Bank-level security for your funds</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PasscodeSetup;
