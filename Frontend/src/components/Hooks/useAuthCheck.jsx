// useAuthCheck.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';

const useAuthCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(store => store.auth);

  const checkAuth = async () => {
    // Don't check if already authenticated
    if (isAuthenticated && user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('useAuthCheck - Checking authentication...');
      // Check authentication status by calling the getProfile endpoint
      const response = await axios.get(`${USER_API_END_POINT}/me`, { 
        withCredentials: true 
      });
      
      console.log('useAuthCheck - Response:', response.data);
      
      if (response.data.success) {
        // User is authenticated, set user data
        console.log('useAuthCheck - Setting user:', response.data.user);
        dispatch(setUser(response.data.user));
      } else {
        // Authentication failed
        console.log('useAuthCheck - Authentication failed');
        dispatch(setUser(null));
      }
    } catch (error) {
      // Authentication failed (401, 403, etc.)
      console.log('useAuthCheck - Error:', error.response?.status, error.response?.data);
      dispatch(setUser(null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only check auth if not already authenticated
    if (!isAuthenticated && !user) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return { isLoading, checkAuth };
};

export default useAuthCheck;