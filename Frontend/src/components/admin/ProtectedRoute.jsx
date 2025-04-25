// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthCheck from '../Hooks/useAuthCheck';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react'; // Import your loader

const ProtectedRoute = ({ children }) => {
  const { isLoading } = useAuthCheck();
  const user = useSelector((state) => state.auth.user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;