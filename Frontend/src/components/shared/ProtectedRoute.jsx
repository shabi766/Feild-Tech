import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { setUser, logout } from '@/redux/authSlice';
import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/environment';
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
        // Validate token with backend
        const response = await api.get(`${API_ENDPOINTS.USER}/me`, {
          withCredentials: true,
        });

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
  if (requiredRole) {
    const userRole = user.role?.toLowerCase();
    const required = requiredRole.toLowerCase();

    // Special case: "Company" role should be treated as "Recruiter" for route protection
    const normalizedUserRole = userRole === 'company' ? 'recruiter' : userRole;

    if (normalizedUserRole !== required) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/app/administrator" replace />;
      } else if (userRole === 'company') {
        // Company recruiter (backend returns role: "Company")
        return <Navigate to="/app/recruiter/dashboard" replace />;
      } else if (userRole === 'recruiter') {
        // Individual recruiter or check recruiterType
        if (user.recruiterType === 'Individual' || !user.companyId) {
          return <Navigate to="/app/recruiter/dashboard-individual" replace />;
        } else {
          return <Navigate to="/app/recruiter/dashboard" replace />;
        }
      } else if (userRole === 'technician') {
        return <Navigate to="/app/technician/home" replace />;
      } else {
        return <Navigate to="/app/technician/home" replace />;
      }
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

