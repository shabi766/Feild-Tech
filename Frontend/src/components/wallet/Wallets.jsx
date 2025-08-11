import React from 'react';
import { useSelector } from 'react-redux';
import TechnicianOnboarding from './TechnicianOnboarding';
import RecruiterWallet from './RecruiterWallet';
import TechnicianWalletOverview from './TechnicianWalletOverview';
import WalletDashboard from './WalletDashboard';

const Wallets = () => {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Wallets</h1>
      <p className="text-gray-600">Securely connect your Stripe account to receive or make payments.</p>
      {role === 'Technician' && (
        <>
          <TechnicianOnboarding />
          <WalletDashboard />
          <TechnicianWalletOverview />
        </>
      )}
      {(role === 'Recruiter' || role === 'Admin') && (
        <>
          <RecruiterWallet />
          <WalletDashboard />
        </>
      )}
    </div>
  );
};

export default Wallets;


