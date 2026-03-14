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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sticky navbar — full width */}
      <div className="sticky top-0 z-40">
        <Navbar setLogoutFlag={setLogoutFlag} />
      </div>

      {/* Below navbar: sidebar + content side by side on desktop */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: persistent on desktop, slide-over on mobile */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col animate-fade-in overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
