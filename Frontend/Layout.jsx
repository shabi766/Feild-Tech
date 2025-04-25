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
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <Navbar />

      {/* ✅ Ensures content pushes the footer down */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* ✅ Adds proper spacing before the footer */}
      <Footer className="mt-10" />
    </div>
  );
};

export default Layout;
