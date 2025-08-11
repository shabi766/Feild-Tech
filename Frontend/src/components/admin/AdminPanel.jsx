import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Wallet,
  Briefcase,
  Building,
  MessageSquare
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import KYCManagement from './KYCManagement';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';
import SystemSettings from './SystemSettings';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [kycStats, setKycStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    technicians: 0,
    clients: 0,
    recruiters: 0
  });

  useEffect(() => {
    // Fetch initial stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch KYC stats
      // Fetch user stats
      // This would be implemented with actual API calls
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminStats />;
      case 'kyc':
        return <KYCManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Manage your platform and users</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex space-x-4">
                <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {kycStats.pending} KYC Pending
                    </span>
                  </div>
                </div>
                
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {userStats.total} Total Users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
