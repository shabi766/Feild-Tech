import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useAuthCheck from './src/components/Hooks/useAuthCheck';
import Sidebar from './src/components/shared/Sidebar';

import { Loader2 } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbars';

const Layout = () => {
  const { isLoading, checkAuth } = useAuthCheck();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky navbar at top */}
      <Navbar />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ paddingLeft: '16px' }}>
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
