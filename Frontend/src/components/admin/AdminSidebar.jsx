import React from 'react';
import { 
  Home, 
  Briefcase, 
  Users, 
  Building, 
  FileText, 
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  Wallet,
  Shield,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/app/recruiter/dashboard' },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/app/recruiter/jobs' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/app/recruiter/clients' },
    { id: 'projects', label: 'Projects', icon: Building, path: '/app/recruiter/projects' },
    { id: 'technicians', label: 'Technicians', icon: Users, path: '/app/recruiter/technicians' },
    { id: 'applicants', label: 'Applicants', icon: FileText, path: '/app/recruiter/applicants' },
    { id: 'teams', label: 'Teams', icon: Users, path: '/app/recruiter/teams' },
    { id: 'templates', label: 'Templates', icon: FileText, path: '/app/recruiter/templates' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/app/recruiter/analytics' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/app/recruiter/calendar' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/app/recruiter/messages' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/app/recruiter/wallet' },
    { id: 'kyc', label: 'KYC Management', icon: Shield, path: '/app/recruiter/kyc' },
    { id: 'users', label: 'User Management', icon: Users, path: '/app/recruiter/users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/app/recruiter/settings' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleTabClick = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Recruiter Panel</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item.id, item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-blue-700' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

