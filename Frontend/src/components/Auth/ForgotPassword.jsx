import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setloading } from '@/redux/authSlice';
import { Loader2, Mail, ArrowLeft, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // email, otp, reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setErrors({ email: 'Email is required' });
            return false;
        } else if (!emailRegex.test(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateOtp = () => {
        if (!otp || otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validatePassword = () => {
        const newErrors = {};
        
        if (!newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendResetEmail = async () => {
        if (!validateEmail()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email });
            if (response.data.success) {
                toast.success('Reset link sent to your email!');
                setStep('otp');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!validateOtp()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${USER_API_END_POINT}/verify-otp`, { email, otp });
            if (response.data.success) {
                toast.success('OTP verified successfully!');
                setStep('reset');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${USER_API_END_POINT}/reset-password`, {
                email,
                otp,
                newPassword
            });
            if (response.data.success) {
                toast.success('Password reset successfully!');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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

    const renderEmailStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">Enter your email address and we'll send you a reset link</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                </div>
                <ErrorMessage error={errors.email} />
            </div>

            <Button 
                onClick={handleSendResetEmail}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send Reset Link
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </div>
    );

    const renderOtpStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600">We've sent a 6-digit code to {email}</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Enter OTP
                </Label>
                <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`h-12 text-center text-lg font-mono border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.otp ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    maxLength={6}
                />
                <ErrorMessage error={errors.otp} />
            </div>

            <div className="flex gap-3">
                <Button 
                    variant="outline"
                    onClick={() => setStep('email')}
                    className="flex-1 h-12 border-gray-300 text-gray-700 font-semibold rounded-lg"
                >
                    Back
                </Button>
                <Button 
                    onClick={handleVerifyOtp}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        'Verify OTP'
                    )}
                </Button>
            </div>
        </div>
    );

    const renderResetStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                <p className="text-gray-600">Enter your new password</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                </Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className={`pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <ErrorMessage error={errors.newPassword} />
                <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <ErrorMessage error={errors.confirmPassword} />
            </div>

            <div className="flex gap-3">
                <Button 
                    variant="outline"
                    onClick={() => setStep('otp')}
                    className="flex-1 h-12 border-gray-300 text-gray-700 font-semibold rounded-lg"
                >
                    Back
                </Button>
                <Button 
                    onClick={handleResetPassword}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {step === 'email' && renderEmailStep()}
                    {step === 'otp' && renderOtpStep()}
                    {step === 'reset' && renderResetStep()}
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Remember your password?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

