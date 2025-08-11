import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdministratorSidebar from './AdministratorSidebar';
import AdministratorStats from './AdministratorStats';
import KYCManagement from './KYCManagement';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import AuditLogs from './AuditLogs';
import AdministratorProfile from './AdministratorProfile';
import SystemMonitoring from './SystemMonitoring';
// Import additional components for new tabs
import Companies from '../admin/Companies';
import AdminJobs from '../admin/AdminJobs';
import AdminStats from '../admin/AdminStats';
import { useAuth } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdministratorPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const { user, logout, validateAuth } = useAuth();
  const navigate = useNavigate();
  const { loading } = useSelector(store => store.auth);

  // Security: Check if user is actually an administrator
  useEffect(() => {
    // Don't redirect if still loading or if user is not yet loaded
    if (loading) return;
    
    if (!user || user.role !== 'Admin') {
      console.log('User not authenticated as admin, redirecting to login');
      navigate('/login?message=admin_access_required');
      return;
    }
  }, [user, navigate, loading]);

  // Security: Session timeout handling (30 minutes of inactivity)
  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const updateActivity = () => {
      setLastActivity(Date.now());
      setSessionTimeout(false);
    };

    const checkSessionTimeout = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        setSessionTimeout(true);
        logout();
        navigate('/login?message=session_expired');
      }
    };

    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session timeout every minute
    const interval = setInterval(checkSessionTimeout, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [lastActivity, logout, navigate]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const validateInterval = setInterval(async () => {
      const isValid = await validateAuth();
      if (!isValid) {
        console.log('Token validation failed during periodic check');
        navigate('/login?message=token_expired');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(validateInterval);
  }, [user, validateAuth, navigate]);

  // Security: Prevent access to admin panel from iframes
  useEffect(() => {
    if (window.self !== window.top) {
      window.top.location.href = window.self.location.href;
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'kyc', 'users', 'companies', 'jobs', 'wallet', 'reports', 'analytics', 'settings', 'audit', 'profile', 'monitoring'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    // Security: Log tab changes for audit purposes
    console.log(`Admin ${user?.email} navigated to ${tab} tab at ${new Date().toISOString()}`);
  };

  // Security: Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeTab === 'settings') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeTab]);

  // Show loading while authentication is being checked
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading administrator panel...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking admin role
  if (user.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  if (sessionTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Your session has expired due to inactivity.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">🔒</div>
            <span className="text-sm text-yellow-800">
              Administrator Panel - Secure Session Active
            </span>
          </div>
          <div className="text-xs text-yellow-600">
            Last Activity: {new Date(lastActivity).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="flex">
        <AdministratorSidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <AdministratorStats />}
          {activeTab === 'kyc' && <KYCManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'companies' && <Companies />}
          {activeTab === 'jobs' && <AdminJobs />}
          {activeTab === 'wallet' && <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-700 mb-4">Wallet System</h2><p className="text-gray-500">Wallet management features coming soon...</p></div>}
          {activeTab === 'reports' && <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-700 mb-4">Reports</h2><p className="text-gray-500">Reporting features coming soon...</p></div>}
          {activeTab === 'analytics' && <AdminStats />}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'audit' && <AuditLogs />}
          {activeTab === 'profile' && <AdministratorProfile user={user} />}
          {activeTab === 'monitoring' && <SystemMonitoring />}
        </main>
      </div>
    </div>
  );
};

export default AdministratorPanel;
