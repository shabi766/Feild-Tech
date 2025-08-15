import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminJobs from './AdminJobs';
import Clients from './Clients';
import Projects from './Projects';
import AllTechnicians from './AllTechnicians';
import Applicants from './Applicants';
import Teams from './Teams';
import Templates from './Templates';
import Companies from './Companies';
import UserManagement from './UserManagement';
import KYCManagement from './KYCManagement';
import AdminStats from './AdminStats';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'jobs':
        return <AdminJobs />;
      case 'clients':
        return <Clients />;
      case 'projects':
        return <Projects />;
      case 'technicians':
        return <AllTechnicians />;
      case 'applicants':
        return <Applicants />;
      case 'teams':
        return <Teams />;
      case 'templates':
        return <Templates />;
      case 'companies':
        return <Companies />;
      case 'kyc':
        return <KYCManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AdminStats />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-64 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;

