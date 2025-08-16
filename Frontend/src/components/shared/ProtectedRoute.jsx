import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { setUser, logout } from '@/redux/authSlice';
import api from '@/lib/axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ requiredRole = null, children }) => {
  const { user, isAuthenticated, loading } = useSelector((store) => store.auth);
  const [isValidating, setIsValidating] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      // Don't validate if already authenticated
      if (isAuthenticated && user) {
        setIsValidating(false);
        return;
      }

      try {
        setIsValidating(true);
        // Check if we have a token
        const token = localStorage.getItem('authToken') || getCookie('token');
        
        if (!token) {
          dispatch(logout());
          setIsValidating(false);
          return;
        }

        // Validate token with backend
        const response = await api.get('/user/me');
        
        if (response.data.success) {
          dispatch(setUser(response.data.user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Token validation error:', error);
        dispatch(logout());
      } finally {
        setIsValidating(false);
      }
    };

    // Only validate if not authenticated and not already validating
    if (!isAuthenticated && !user && !isValidating) {
      validateToken();
    } else if (isAuthenticated && user) {
      setIsValidating(false);
    }
  }, [dispatch, isAuthenticated, user, isValidating]);

  // Helper function to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // Show loading while validating or if Redux is still loading
  if (isValidating || loading) {
    return <LoadingSpinner text="Validating authentication..." fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

      // Check role requirements if specified
    if (requiredRole && user.role !== requiredRole) {
      // Redirect based on user's actual role
      if (user.role === 'Admin') {
        return <Navigate to="/app/administrator" replace />;
      } else if (user.role === 'Recruiter') {
        if (user.recruiterType === 'Individual' || !user.companyId) {
          return <Navigate to="/app/recruiter/dashboard-individual" replace />;
        } else {
          return <Navigate to="/app/recruiter/dashboard" replace />;
        }
      } else if (user.role === 'Technician') {
        return <Navigate to="/app/technician/home" replace />;
      } else {
        return <Navigate to="/app/technician/home" replace />;
      }
    }

  // If this is a route group (has children), render the Outlet
  if (children === undefined) {
    return <Outlet />;
  }

  // Otherwise render the children
  return children;
};

export default ProtectedRoute;

