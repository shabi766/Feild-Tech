import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useAuthCheck from './src/components/Hooks/useAuthCheck';
import Sidebar from './src/components/shared/Sidebar';
import { useSelector } from 'react-redux';

import { Loader2 } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar/Navbars';

const Layout = () => {
  const { isLoading, checkAuth, setLogoutFlag } = useAuthCheck();
  const { user, isAuthenticated } = useSelector(store => store.auth);

  useEffect(() => {
    // Only run auth check if user is not already authenticated
    if (!isAuthenticated && !user) {
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, user]);

  // If user is already authenticated, don't show loading
  if (!isAuthenticated && !user && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky navbar at top */}
      <Navbar setLogoutFlag={setLogoutFlag} />
      
      {/* Sidebar - now has its own positioning */}
      <Sidebar />

      {/* Main content area - adjusted for new sidebar */}
      <div className="pt-20 pl-20">
        <main className="min-h-screen p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
