import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const SecurityMiddleware = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [securityChecks, setSecurityChecks] = useState({
    roleVerified: false,
    sessionValid: false,
    ipWhitelisted: false,
    deviceTrusted: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSecurityChecks = async () => {
      try {
        // Check user role
        if (!user || user.role !== 'Admin') {
          throw new Error('Insufficient privileges');
        }

        // Check session validity
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No valid session');
        }

        // Verify token with backend
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify-admin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Session verification failed');
        }

        const data = await response.json();
        
        // Check IP whitelist (if configured)
        const ipCheck = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/security/check-ip`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Check device trust (if configured)
        const deviceCheck = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/security/check-device`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setSecurityChecks({
          roleVerified: true,
          sessionValid: true,
          ipWhitelisted: ipCheck.ok,
          deviceTrusted: deviceCheck.ok
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Security check failed:', error);
        navigate('/login?message=security_check_failed');
      }
    };

    performSecurityChecks();
  }, [user, navigate]);

  // Additional security measures
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e) => e.preventDefault();
    
    // Prevent F12, Ctrl+Shift+I, Ctrl+U
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent view source
    const handleKeyUp = (e) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Security Verification</h2>
          <p className="text-gray-500">Performing security checks...</p>
        </div>
      </div>
    );
  }

  if (!securityChecks.roleVerified || !securityChecks.sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Security verification failed.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="security-protected">
      {/* Security Status Bar */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-green-700">🔒 Security: Active</span>
            <span className="text-green-600">Role: Verified</span>
            <span className="text-green-600">Session: Valid</span>
          </div>
          <div className="flex items-center space-x-4">
            {securityChecks.ipWhitelisted && (
              <span className="text-green-600">IP: Whitelisted</span>
            )}
            {securityChecks.deviceTrusted && (
              <span className="text-green-600">Device: Trusted</span>
            )}
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default SecurityMiddleware;
