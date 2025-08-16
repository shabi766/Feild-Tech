import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import WalletOnboarding from './WalletOnboarding';
import PasscodeSetup from './PasscodeSetup';
import PasscodeEntry from './PasscodeEntry';
import NewWalletDashboard from './NewWalletDashboard';
import axios from 'axios';

const Wallets = () => {
  const { user } = useSelector((s) => s.auth);
  const [walletStatus, setWalletStatus] = useState('checking'); // 'checking', 'kyc_required', 'passcode_required', 'ready'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const checkWalletStatus = async () => {
    try {
      setLoading(true);
      
      // Check KYC status
      const kycRes = await axios.get('/api/v1/kyc/status', { withCredentials: true });
      const kycStatus = kycRes.data?.kyc?.kycStatus || 'unverified';
      
      if (kycStatus === 'unverified') {
        setWalletStatus('kyc_required');
      } else if (kycStatus === 'pending') {
        setWalletStatus('kyc_pending');
      } else if (kycStatus === 'verified') {
        // Check if passcode is set
        try {
          const passcodeRes = await axios.get('/api/v1/wallet-passcode/status', { withCredentials: true });
          if (passcodeRes.data?.success && passcodeRes.data.data?.hasPasscode) {
            setWalletStatus('ready');
          } else {
            setWalletStatus('passcode_required');
          }
        } catch (err) {
          console.error('Failed to check passcode status:', err);
          setWalletStatus('passcode_required');
        }
      }
      
    } catch (err) {
      console.error('Failed to check wallet status:', err);
      // If KYC endpoint doesn't exist, assume KYC is required
      setWalletStatus('kyc_required');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (status) => {
    if (status === 'kyc_approved') {
      setWalletStatus('passcode_required');
    }
  };

  const handlePasscodeComplete = (status) => {
    if (status === 'passcode_set') {
      setWalletStatus('ready');
    }
  };

  const handlePasscodeSuccess = () => {
    setWalletStatus('ready');
  };

  const handlePasscodeCancel = () => {
    // User cancelled passcode entry, stay in current state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking wallet status...</p>
        </div>
      </div>
    );
  }

  // Render appropriate component based on wallet status
  switch (walletStatus) {
    case 'kyc_required':
      return <WalletOnboarding onComplete={handleOnboardingComplete} />;
    
    case 'kyc_pending':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 text-blue-600">⏳</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">KYC Under Review</h1>
            <p className="text-gray-600 mb-6">
              We've received your KYC application and our team is currently reviewing your documents. 
              This process typically takes 24-48 hours.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong><br />
                • Document verification<br />
                • Background checks<br />
                • Approval notification<br />
                • Wallet access setup
              </p>
            </div>
          </div>
        </div>
      );
    
    case 'passcode_required':
      return <PasscodeSetup onComplete={handlePasscodeComplete} />;
    
    case 'ready':
      return (
        <div className="w-full">
          <NewWalletDashboard />
        </div>
      );
    
    default:
      return <WalletOnboarding onComplete={handleOnboardingComplete} />;
  }
};

export default Wallets;


