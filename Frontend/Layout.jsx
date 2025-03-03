// Layout.jsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useAuthCheck from './src/components/Hooks/useAuthCheck';
import Sidebar from './src/components/shared/Sidebar';
import Navbar from './src/components/shared/Navbar';
import { Loader2 } from 'lucide-react'; // If you're using lucide-react

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
    <>
      <Sidebar />
      <Navbar />
      <Outlet />
    </>
  );
};

export default Layout;