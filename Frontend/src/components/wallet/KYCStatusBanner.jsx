import React from 'react';

const KYCStatusBanner = ({ status, onRefresh }) => {
  if (status === 'verified') {
    return (
      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-green-800">KYC Verification Complete</h3>
              <p className="text-sm text-green-700">Your account has been verified and you have full access to your wallet.</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">KYC Under Review</h3>
              <p className="text-sm text-yellow-700">Your verification is being processed. This typically takes 24-48 hours.</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">KYC Verification Failed</h3>
              <p className="text-sm text-red-700">Your verification was not approved. Please review and resubmit your information.</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default KYCStatusBanner;
