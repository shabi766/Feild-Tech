import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser, setToken } from '@/redux/authSlice';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(null);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, user } = useSelector((store) => store.auth);

               // Check if user is already logged in
           useEffect(() => {
               if (user) {
                   if (user.role === 'Admin') {
                       navigate('/app/administrator');
                   } else {
                       navigate('/');
                       toast.error("Access denied. Administrator privileges required.");
                   }
               }
           }, [user, navigate]);

    // Check for lockout status
    useEffect(() => {
        const lockoutInfo = localStorage.getItem('adminLockout');
        if (lockoutInfo) {
            const { attempts, timestamp } = JSON.parse(lockoutInfo);
            const now = Date.now();
            const lockoutDuration = 15 * 60 * 1000; // 15 minutes
            
            if (now - timestamp < lockoutDuration) {
                setIsLocked(true);
                setLoginAttempts(attempts);
                setLockoutTime(new Date(timestamp + lockoutDuration));
            } else {
                localStorage.removeItem('adminLockout');
                setIsLocked(false);
                setLoginAttempts(0);
            }
        }
    }, []);

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(input.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!input.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (isLocked) {
            toast.error("Account temporarily locked due to multiple failed attempts.");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/Login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            
            if (res.data.success) {
                // Check if user is an administrator
                if (res.data.user.role !== 'Admin') {
                    toast.error("Access denied. Administrator privileges required.");
                    // Increment failed attempts for non-admin users
                    handleFailedAttempt();
                    return;
                }
                
                dispatch(setUser(res.data.user));
                dispatch(setToken(res.data.token || res.data.user.token));
                
                // Add a small delay to ensure state is properly set
                setTimeout(() => {
                    navigate("/app/administrator");
                }, 100);
                
                toast.success("Welcome, Administrator!");
                
                // Reset failed attempts on successful login
                localStorage.removeItem('adminLockout');
                setLoginAttempts(0);
                setIsLocked(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Authentication failed.");
            handleFailedAttempt();
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleFailedAttempt = () => {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
            // Lock account for 15 minutes
            const lockoutInfo = {
                attempts: newAttempts,
                timestamp: Date.now()
            };
            localStorage.setItem('adminLockout', JSON.stringify(lockoutInfo));
            setIsLocked(true);
            setLockoutTime(new Date(Date.now() + 15 * 60 * 1000));
            toast.error("Account locked due to multiple failed attempts. Please try again in 15 minutes.");
        } else {
            toast.error(`Login failed. ${5 - newAttempts} attempts remaining before lockout.`);
        }
    };

    const handleGoogleSignIn = () => {
        toast.info("Google Sign In coming soon!");
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertTriangle size={16} />
                <span>{error}</span>
            </div>
        );
    };

    if (isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">Account Locked</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Too many failed login attempts. Your account has been temporarily locked.
                        </p>
                        <div className="mt-4 p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Lockout Duration:</strong> 15 minutes<br />
                                <strong>Lockout Ends:</strong> {lockoutTime?.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <Link
                            to="/"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Administrator Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Secure access to system administration panel
                    </p>
                    
                    {/* Security Notice */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                            <Shield size={16} />
                            <span className="text-sm font-medium">Enhanced Security Active</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                            Failed attempts: {loginAttempts}/5 (Account locks after 5 attempts)
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="pl-10 h-12 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="admin@company.com"
                                />
                            </div>
                            <ErrorMessage error={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={input.password}
                                    onChange={changeEventHandler}
                                    className="pl-10 pr-10 h-12 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <ErrorMessage error={errors.password} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Forgot your password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || isLocked}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-5 w-5" />
                                Access Administrator Panel
                            </>
                        )}
                    </Button>

                    {/* Alternative Actions */}
                    <div className="text-center space-y-3">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to regular login
                            </Link>
                            
                            <div className="text-xs text-gray-500">
                                Need help? Contact system administrator
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
