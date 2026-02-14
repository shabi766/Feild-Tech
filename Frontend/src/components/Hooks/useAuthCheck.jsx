// useAuthCheck.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { USER_API_END_POINT } from '@/components/utils/constant';

const useAuthCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(store => store.auth);
  const isLoggingOut = useRef(false);
  const lastAuthCheck = useRef(null);

  const checkAuth = async () => {
    // Don't check if already authenticated and user has complete data
    if (isAuthenticated && user && user.companyId) {
      console.log('useAuthCheck - User already authenticated with complete data, skipping check');
      setIsLoading(false);
      return;
    }

    // Don't check if we're in the process of logging out
    if (isLoggingOut.current) {
      console.log('useAuthCheck - Logout in progress, skipping auth check');
      return;
    }

    // Prevent rapid successive calls
    const now = Date.now();
    if (lastAuthCheck.current && (now - lastAuthCheck.current) < 1000) {
      console.log('useAuthCheck - Auth check called too recently, skipping');
      return;
    }
    lastAuthCheck.current = now;

    try {
      setIsLoading(true);
      console.log('useAuthCheck - Checking authentication...');
      console.log('useAuthCheck - Current user data:', user);

      // Check authentication status by calling the getProfile endpoint
      const response = await api.get(`${USER_API_END_POINT}/me`);

      console.log('useAuthCheck - Response:', response.data);

      if (response.data.success) {
        // User is authenticated, set user data
        console.log('useAuthCheck - Setting user:', response.data.user);
        console.log('useAuthCheck - User companyId:', response.data.user.companyId);
        dispatch(setUser(response.data.user));
      } else {
        // Authentication failed
        console.log('useAuthCheck - Authentication failed');
        dispatch(setUser(null));
      }
    } catch (error) {
      // Authentication failed (401, 403, etc.)
      console.log('useAuthCheck - Error:', error.response?.status, error.response?.data);

      // Only dispatch setUser(null) if we're not in the middle of a logout
      if (!isLoggingOut.current) {
        dispatch(setUser(null));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for logout action to set the flag
  useEffect(() => {
    if (!isAuthenticated && !user) {
      // Check if this is a fresh logout (no user data and not authenticated)
      if (isLoggingOut.current) {
        console.log('useAuthCheck - Fresh logout detected, skipping auth check');
        return;
      }

      // Only check auth if not already authenticated or if user data is incomplete
      if (!isAuthenticated || !user || !user.companyId) {
        console.log('useAuthCheck useEffect - Checking auth, isAuthenticated:', isAuthenticated, 'user:', !!user, 'companyId:', user?.companyId);
        checkAuth();
      } else {
        console.log('useAuthCheck useEffect - User already authenticated with complete data, skipping check');
        setIsLoading(false);
      }
    } else {
      // Reset logout flag when user becomes authenticated
      isLoggingOut.current = false;
    }
  }, [isAuthenticated, user]);

  // Function to set logout flag
  const setLogoutFlag = () => {
    isLoggingOut.current = true;
    // Reset the flag after a short delay to allow cleanup
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 2000);
  };

  return { isLoading, checkAuth, setLogoutFlag };
};

export default useAuthCheck;