import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Settings, Users, BarChart3, LogOut, User2, Activity, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';
import logo from "@/assets/logo.png";

const AdministratorNavbar = ({ user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect for navbar transparency
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { 
            path: '/administrator', 
            label: 'Dashboard', 
            icon: BarChart3,
            description: 'System Overview'
        },
        { 
            path: '/administrator?tab=kyc', 
            label: 'KYC Management', 
            icon: Users,
            description: 'Review KYC Requests'
        }
    ];

    const handleLogout = async () => {
        setLoading(true);
        try {
            // Try to call logout endpoint, but don't fail if it returns 401
            const res = await axios.get(`${USER_API_END_POINT}/Logout`, { withCredentials: true });
            if (res.data.success) {
                toast.success("Successfully logged out");
            }
        } catch (error) {
            // Don't show error for 401 (token expired) as this is expected during logout
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || "Logout failed");
            }
        } finally {
            // Always clear all authentication state and redirect regardless of API response
            dispatch(logout());
            
            // Force redirect to login page to avoid any routing issues
            navigate("/login", { replace: true });
            setLoading(false);
        }
    };

    return (
        <div className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/60' 
                : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}>
            <div className='flex items-center justify-between h-16 w-full px-4 lg:px-6'>
                {/* Left side - Logo and Navigation */}
                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex items-center gap-2 group">
                        <img 
                            src={logo} 
                            alt="ShiftsMate Logo" 
                            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
                        />
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Main Navigation */}
                        <div className="flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path.split('?')[0] && 
                                               (location.search === '' || location.search === item.path.split('?')[1] || 
                                                item.path.split('?')[1] === undefined);
                                
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 group flex items-center gap-2 text-sm ${
                                            isActive 
                                                ? 'text-blue-600 bg-blue-50/80' 
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/60'
                                        }`}
                                        title={item.description}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="relative z-10">{item.label}</span>
                                        {isActive && (
                                            <div className="absolute inset-0 bg-blue-50/80 rounded-lg transition-all duration-300" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 rounded-lg transition-all duration-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Right side - Administrator specific content */}
                <div className="flex items-center gap-4">
                    {/* System Status Indicator */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">System Online</span>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Administrator</span>
                    </div>
                    
                    {/* Profile Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="cursor-pointer group">
                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/60 transition-all duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user?.fullname?.charAt(0)?.toUpperCase() || 'A'}
                                        </span>
                                    </div>
                                    <div className="text-sm hidden md:block">
                                        <div className="font-medium text-gray-900">{user?.fullname || 'Administrator'}</div>
                                        <div className="text-gray-500">{user?.email}</div>
                                    </div>
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/50 z-50 p-6">
                            <div className='flex gap-4 items-center mb-4 pb-4 border-b border-gray-100'>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg font-medium">
                                        {user?.fullname?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className='font-semibold text-gray-800 text-lg'>{user?.fullname || 'Administrator'}</h4>
                                    <p className='text-sm text-gray-500'>{user?.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">System Administrator</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='space-y-2'>
                                <Link 
                                    to="/app/administrator?tab=profile" 
                                    className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600'
                                >
                                    <User2 size={18} /> 
                                    <span className="font-medium">Profile Settings</span>
                                </Link>
                                
                                <Link 
                                    to="/app/administrator?tab=settings" 
                                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                >
                                    <Settings size={18} /> 
                                    <span className="font-medium">System Configuration</span>
                                </Link>
                                
                                <Link 
                                    to="/app/administrator?tab=audit" 
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50/80 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                >
                                    <FileText size={18} /> 
                                    <span className="font-medium">Audit Logs</span>
                                </Link>
                                
                                <Link 
                                    to="/app/administrator?tab=monitoring" 
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50/50/80 transition-all duration-200 text-gray-700 hover:text-blue-600"
                                >
                                    <Activity size={18} /> 
                                    <span className="font-medium">System Monitoring</span>
                                </Link>
                                
                                <div className="border-t border-gray-100 pt-2 mt-2">
                                    <button 
                                        onClick={handleLogout} 
                                        disabled={loading} 
                                        className='flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-red-50/80 transition-all duration-200 text-gray-700 hover:text-red-600 w-full disabled:opacity-50'
                                    >
                                        <LogOut size={18} /> 
                                        <span className="font-medium">{loading ? 'Logging out...' : 'Logout'}</span>
                                    </button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default AdministratorNavbar;

