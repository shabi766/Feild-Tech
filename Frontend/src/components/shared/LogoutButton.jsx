import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/redux/authSlice';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import api from '@/lib/axios';

const LogoutButton = ({ variant = "default", className = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await api.get('/user/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with frontend logout even if backend fails
    } finally {
      // Clear frontend state
      dispatch(logout());
      
      // Redirect to login
      navigate('/login');
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;

