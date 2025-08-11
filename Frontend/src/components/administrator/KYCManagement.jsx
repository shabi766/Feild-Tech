import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { ADMINISTRATION_API_END_POINT } from '../utils/constant';

const KYCManagement = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [itemsPerPage] = useState(20);

  // Fetch KYC requests from backend
  const fetchKYCRequests = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${ADMINISTRATION_API_END_POINT}/kyc/requests?${params}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setKycRequests(response.data.data.kycRequests);
        setFilteredRequests(response.data.data.kycRequests);
        setTotalPages(response.data.data.totalPages);
        setTotalRequests(response.data.data.totalRequests);
        setCurrentPage(page);
      } else {
        throw new Error(response.data.message || 'Failed to fetch KYC requests');
      }
      
    } catch (err) {
      console.error('Error fetching KYC requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch KYC requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle KYC actions (approve, reject, set pending)
  const handleKYCAction = async (userId, action, remarks = '') => {
    try {
      setProcessingAction(`${userId}-${action}`);
      setActionError(null);
      
      const response = await axios.put(`${ADMINISTRATION_API_END_POINT}/kyc/${userId}/status`, {
        status: action,
        remarks: remarks || `KYC ${action} by administrator`
      }, { withCredentials: true });

      if (response.data.success) {
        // Refresh KYC requests list to get updated data
        await fetchKYCRequests(currentPage);
        
        // Close modal if open
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }

        // Show success message
        console.log(`KYC request ${action} successfully`);
      } else {
        throw new Error(response.data.message || `Failed to ${action} KYC request`);
      }
      
    } catch (err) {
      console.error(`Error ${action}ing KYC request:`, err);
      setActionError(err.response?.data?.message || `Failed to ${action} KYC request`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = kycRequests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.kyc?.kycStatus === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [kycRequests, statusFilter, searchTerm]);

  // Fetch KYC requests when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchKYCRequests(1);
  }, [statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        fetchKYCRequests(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchKYCRequests();
  }, []);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handlePageChange = (page) => {
    fetchKYCRequests(page);
  };

  if (loading && kycRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  if (error && kycRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchKYCRequests()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Management</h1>
        <p className="text-gray-600">Review and manage Know Your Customer verification requests</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['pending', 'verified', 'rejected', 'under_review'].map((status) => {
          const count = kycRequests.filter(request => request.kyc?.kycStatus === status).length;
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
            <button
              onClick={() => fetchKYCRequests(currentPage)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KYC Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <motion.tr
                  key={request._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {request.fullname?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.fullname || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                        {request.phoneNumber && (
                          <div className="text-sm text-gray-500">{request.phoneNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {request.kyc?.kycType || 'Individual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.kyc?.kycStatus)}`}>
                      {request.kyc?.kycStatus ? request.kyc.kycStatus.replace('_', ' ') : 'Not submitted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.kyc?.submittedAt ? new Date(request.kyc.submittedAt).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(request)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {request.kyc?.kycStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleKYCAction(request._id, 'verified')}
                            disabled={processingAction === `${request._id}-verified`}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 transition-colors"
                            title="Approve KYC"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleKYCAction(request._id, 'rejected')}
                            disabled={processingAction === `${request._id}-rejected`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                            title="Reject KYC"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No KYC requests found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRequests)} of {totalRequests} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Request Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">KYC Request Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* User Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.fullname || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                  </div>
                  {selectedRequest.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.role || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* KYC Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">KYC Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {selectedRequest.kyc?.kycStatus ? selectedRequest.kyc.kycStatus.replace('_', ' ') : 'Not submitted'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.kyc?.kycType || 'Individual'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRequest.kyc?.submittedAt ? new Date(selectedRequest.kyc.submittedAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  {selectedRequest.kyc?.verifiedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedRequest.kyc.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedRequest.kyc?.rejectedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rejected At</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedRequest.kyc.rejectedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.kyc?.documents && selectedRequest.kyc.documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Submitted Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.kyc.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-medium">PDF</span>
                        </div>
                        <span className="text-sm text-gray-900">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedRequest.kyc?.remarks && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Remarks</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.kyc.remarks}
                  </p>
                </div>
              )}

              {/* Action Error Display */}
              {actionError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800">{actionError}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.kyc?.kycStatus === 'pending' && (
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleKYCAction(selectedRequest._id, 'verified')}
                    disabled={processingAction === `${selectedRequest._id}-verified`}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {processingAction === `${selectedRequest._id}-verified` ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {processingAction === `${selectedRequest._id}-verified` ? 'Processing...' : 'Approve KYC'}
                  </button>
                  <button
                    onClick={() => handleKYCAction(selectedRequest._id, 'rejected')}
                    disabled={processingAction === `${selectedRequest._id}-rejected`}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {processingAction === `${selectedRequest._id}-rejected` ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {processingAction === `${selectedRequest._id}-rejected` ? 'Processing...' : 'Reject KYC'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KYCManagement;
