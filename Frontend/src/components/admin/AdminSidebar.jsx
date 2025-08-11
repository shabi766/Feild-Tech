import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Shield,
  AlertTriangle,
  UserCheck,
  Wallet,
  Briefcase,
  Building,
  MessageSquare,
  LogOut
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      id: 'kyc',
      label: 'KYC Management',
      icon: Shield,
      description: 'Verify user identities',
      badge: '12' // Pending KYC count
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage all user accounts'
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: Briefcase,
      description: 'Monitor and manage jobs'
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building,
      description: 'Manage company accounts'
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: MessageSquare,
      description: 'Handle user support requests'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  const handleLogout = async () => {
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
    }
  };

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-50"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group relative`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-red-100 text-red-600'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
