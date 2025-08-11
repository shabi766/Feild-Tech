import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '../utils/constant';

const KYCManagement = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      // This would be an actual API call to get all KYC requests
      // const response = await axios.get(`${WALLET_API_END_POINT}/admin/kyc`, { withCredentials: true });
      
      // Mock data for now
      const mockData = [
        {
          id: 1,
          userId: 'user123',
          fullname: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          kycStatus: 'pending',
          submittedAt: '2024-01-15T10:30:00Z',
          documents: {
            cnicFront: 'https://example.com/cnic-front.jpg',
            cnicBack: 'https://example.com/cnic-back.jpg'
          },
          kycData: {
            fatherName: 'Robert Doe',
            cnicNumber: '12345-1234567-1',
            dateOfBirth: '1990-05-15',
            address: '123 Main St, City, Country'
          }
        },
        {
          id: 2,
          userId: 'user456',
          fullname: 'Jane Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+1234567891',
          kycStatus: 'verified',
          submittedAt: '2024-01-14T15:45:00Z',
          verifiedAt: '2024-01-15T09:15:00Z',
          documents: {
            cnicFront: 'https://example.com/cnic-front-2.jpg',
            cnicBack: 'https://example.com/cnic-back-2.jpg'
          },
          kycData: {
            fatherName: 'Michael Smith',
            cnicNumber: '98765-9876543-2',
            dateOfBirth: '1988-12-03',
            address: '456 Oak Ave, Town, Country'
          }
        }
      ];
      
      setKycRequests(mockData);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKYCStatusUpdate = async (requestId, status, reason = '') => {
    try {
      // This would be an actual API call to update KYC status
      // await axios.put(`${WALLET_API_END_POINT}/admin/kyc/${requestId}`, {
      //   status,
      //   reason
      // }, { withCredentials: true });
      
      // Update local state
      setKycRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, kycStatus: status, verifiedAt: status === 'verified' ? new Date().toISOString() : undefined }
          : req
      ));
      
      setShowModal(false);
      setSelectedRequest(null);
      
      // Show success message
      console.log(`KYC ${status} for user ${requestId}`);
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const filteredRequests = kycRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.kycStatus === filter;
    const matchesSearch = request.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KYC Management</h2>
          <p className="text-gray-600">Review and verify user identity documents</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: kycRequests.length, color: 'bg-blue-500' },
          { label: 'Pending Review', value: kycRequests.filter(r => r.kycStatus === 'pending').length, color: 'bg-amber-500' },
          { label: 'Verified', value: kycRequests.filter(r => r.kycStatus === 'verified').length, color: 'bg-green-500' },
          { label: 'Rejected', value: kycRequests.filter(r => r.kycStatus === 'rejected').length, color: 'bg-red-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* KYC Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">KYC Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request, index) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {request.fullname.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.fullname}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.kycStatus)}`}>
                      {getStatusIcon(request.kycStatus)}
                      <span className="ml-1 capitalize">{request.kycStatus}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(request.documents.cnicFront, '_blank')}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Front
                      </button>
                      <button
                        onClick={() => window.open(request.documents.cnicBack, '_blank')}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Back
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.kycStatus === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      </div>
                    )}
                    {request.kycStatus === 'verified' && (
                      <span className="text-green-600">Verified</span>
                    )}
                    {request.kycStatus === 'rejected' && (
                      <span className="text-red-600">Rejected</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Review Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Review KYC Application</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedRequest.fullname}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedRequest.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedRequest.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">KYC Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Father: {selectedRequest.kycData.fatherName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">CNIC: {selectedRequest.kycData.cnicNumber}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">DOB: {selectedRequest.kycData.dateOfBirth}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedRequest.kycData.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Documents */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Identity Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">CNIC Front</h5>
                      <img
                        src={selectedRequest.documents.cnicFront}
                        alt="CNIC Front"
                        className="w-full h-48 object-cover rounded border border-gray-200"
                      />
                      <button
                        onClick={() => window.open(selectedRequest.documents.cnicFront, '_blank')}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">CNIC Back</h5>
                      <img
                        src={selectedRequest.documents.cnicBack}
                        alt="CNIC Back"
                        className="w-full h-48 object-cover rounded border border-gray-200"
                      />
                      <button
                        onClick={() => window.open(selectedRequest.documents.cnicBack, '_blank')}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => handleKYCStatusUpdate(selectedRequest.id, 'rejected', 'Documents do not match requirements')}
                    className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleKYCStatusUpdate(selectedRequest.id, 'verified')}
                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve & Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYCManagement;
