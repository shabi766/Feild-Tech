// useAuthCheck.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setuser } from '@/redux/authSlice';
import { toast } from 'sonner';

const useAuthCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const checkAuth = () => {
    const token = localStorage.getItem('token'); // Adjust storage if needed
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem('token');
          dispatch(setuser(null));
          navigate('/login');
          toast.info('Your session has expired. Please log in again.');
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        dispatch(setuser(null));
        navigate('/login');
      }
    }
    setIsLoading(false); // Set loading to false after check
  };

  useEffect(() => {
    checkAuth();
  }, [navigate, dispatch]);

  return { isLoading, checkAuth }; // Return loading state
};

export default useAuthCheck;