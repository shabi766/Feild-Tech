import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setloading, setuser } from '@/redux/authSlice';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { Loading, user } = useSelector((store) => store.auth);

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

        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        try {
            dispatch(setloading(true));
            const res = await axios.post(`${USER_API_END_POINT}/Login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setuser(res.data.user));
                
                // Redirect based on user role
                if (res.data.user.role === 'Recruiter' || res.data.user.role === 'Admin') {
                    navigate("/dashboard");
                } else if (res.data.user.role === 'Technician') {
                    navigate("/home");
                } else {
                    // Default fallback
                    navigate("/home");
                }
                
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            dispatch(setloading(false));
        }
    };

    const handleGoogleSignIn = () => {
        // TODO: Implement Google Sign In
        toast.info("Google Sign In coming soon!");
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };
    
    useEffect(() => {
        if (user) {
            // If user is already logged in, redirect based on role
            if (user.role === 'Recruiter' || user.role === 'Admin') {
                navigate("/dashboard");
            } else if (user.role === 'Technician') {
                navigate("/home");
            } else {
                navigate("/home");
            }
        }
    }, [user, navigate]);

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
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account to continue</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={input.email}
                                    name="email"
                                    onChange={changeEventHandler}
                                    placeholder="Enter your email"
                                    className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                />
                            </div>
                            <ErrorMessage error={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={input.password}
                                    name="password"
                                    onChange={changeEventHandler}
                                    placeholder="Enter your password"
                                    className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <ErrorMessage error={errors.password} />
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]" 
                            disabled={Loading}
                        >
                            {Loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Google Sign In Button */}
                    <Button 
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                        onClick={handleGoogleSignIn}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Sign Up Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/role-selection" 
                                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;