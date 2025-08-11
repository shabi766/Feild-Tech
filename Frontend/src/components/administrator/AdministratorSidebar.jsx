import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Users,
  Settings,
  BarChart3,
  FileText,
  Building,
  Briefcase,
  Wallet,
  MessageSquare,
  ClipboardList,
  User2,
  Activity
} from 'lucide-react';

const AdministratorSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Platform overview and analytics',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'kyc',
      label: 'KYC Management',
      icon: Shield,
      description: 'Review and manage KYC requests',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage user accounts and permissions',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building,
      description: 'Manage company accounts',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: Briefcase,
      description: 'Monitor and manage job postings',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'wallet',
      label: 'Wallet System',
      icon: Wallet,
      description: 'Monitor wallet transactions',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Generate system reports',
      color: 'from-rose-500 to-rose-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Advanced analytics and insights',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Configure system parameters',
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: ClipboardList,
      description: 'View system activity and administrative actions',
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User2,
      description: 'Manage your administrator profile',
      color: 'from-violet-500 to-violet-600'
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Activity,
      description: 'Monitor system health and performance',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-72 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 min-h-screen relative"
    >
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-300 cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Administrator
            </h2>
            <p className="text-sm text-gray-500 font-medium">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu */}
      <nav className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ 
                x: 6,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 shadow-md'
                  : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-md border-2 border-transparent'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg' 
                    : `bg-gradient-to-br ${item.color} opacity-70 group-hover:opacity-100 group-hover:shadow-md`
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-white'
                  }`} />
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${
                    isActive ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 leading-relaxed ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
                
                {/* Hover arrow indicator */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom spacing for better visual balance */}
      <div className="h-6"></div>
    </motion.div>
  );
};

export default AdministratorSidebar;
