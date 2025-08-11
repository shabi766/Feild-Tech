import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Trash2,
  Users, 
  MoreHorizontal, 
  Edit, 
  Plus
} from 'lucide-react';
import axios from 'axios';
import { ADMINISTRATION_API_END_POINT } from '../utils/constant';
import { UserContext } from '../../context/UserContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage] = useState(20);

  // Fetch users from backend
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${ADMINISTRATION_API_END_POINT}/users?${params}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setFilteredUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.totalUsers);
        setCurrentPage(page);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle user actions (activate, suspend, delete)
  const handleUserAction = async (userId, action, reason = '') => {
    try {
      setProcessingAction(`${userId}-${action}`);
      setActionError(null);
      
      let response;
      
      switch (action) {
        case 'activate':
          response = await axios.put(`${ADMINISTRATION_API_END_POINT}/users/${userId}/status`, {
            status: 'active',
            reason: reason || 'User activated by administrator'
          }, { withCredentials: true });
          break;
          
        case 'suspend':
          response = await axios.put(`${ADMINISTRATION_API_END_POINT}/users/${userId}/status`, {
            status: 'suspended',
            reason: reason || 'User suspended by administrator'
          }, { withCredentials: true });
          break;
          
        case 'delete':
          response = await axios.delete(`${ADMINISTRATION_API_END_POINT}/users/${userId}`, {
            data: { reason: reason || 'User deleted by administrator' },
            withCredentials: true
          });
          break;
          
        default:
          throw new Error('Invalid action');
      }

      if (response.data.success) {
        // Refresh users list to get updated data
        await fetchUsers(currentPage);
        
        // Close modal if open
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedUser(null);
        }

        // Show success message
        toast.success(`User ${action}d successfully`);
      } else {
        throw new Error(response.data.message || `Failed to ${action} user`);
      }
      
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      setActionError(err.response?.data?.message || `Failed to ${action} user`);
      toast.error(`Failed to ${action} user: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchTerm]);

  // Fetch users when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(1);
        fetchUsers(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'Technician': return 'bg-blue-100 text-blue-800';
      case 'Recruiter': return 'bg-purple-100 text-purple-800';
      case 'Administrator': return 'bg-red-100 text-red-800';
      case 'Client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusColor = (kycStatus) => {
    switch (kycStatus) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'not_submitted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchUsers()}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {['active', 'inactive', 'suspended', 'pending', 'deleted'].map((status) => {
          const count = users.filter(user => user.status === status).length;
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
                  {status === 'active' && <UserCheck className="w-4 h-4" />}
                  {status === 'inactive' && <Clock className="w-4 h-4" />}
                  {status === 'suspended' && <UserX className="w-4 h-4" />}
                  {status === 'pending' && <Clock className="w-4 h-4" />}
                  {status === 'deleted' && <Trash2 className="w-4 h-4" />}
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="Technician">Technician</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Administrator">Administrator</option>
              <option value="Client">Client</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="deleted">Deleted</option>
            </select>
            <button
              onClick={() => fetchUsers(currentPage)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.fullname?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullname || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phoneNumber && (
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKYCStatusColor(user.kyc?.kycStatus)}`}>
                      {user.kyc?.kycStatus ? user.kyc.kycStatus.replace('_', ' ') : 'Not submitted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleUserAction(user._id, 'activate')}
                          disabled={processingAction === `${user._id}-activate`}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 transition-colors"
                          title="Activate User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleUserAction(user._id, 'suspend')}
                          disabled={processingAction === `${user._id}-suspend`}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50 transition-colors"
                          title="Suspend User"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                      {user.status !== 'deleted' && (
                        <button
                          onClick={() => handleUserAction(user._id, 'delete')}
                          disabled={processingAction === `${user._id}-delete`}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} results
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

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.fullname || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.role || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.status || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {selectedUser.kyc?.kycStatus ? selectedUser.kyc.kycStatus.replace('_', ' ') : 'Not submitted'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedUser._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  {selectedUser.lastLoginAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.lastLoginAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedUser.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {selectedUser.profile && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.profile.bio && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile.bio}</p>
                      </div>
                    )}
                    {selectedUser.profile.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.profile.location}</p>
                      </div>
                    )}
                    {selectedUser.profile.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <p className="mt-1 text-sm text-gray-900">
                          <a href={selectedUser.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedUser.profile.website}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
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
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {selectedUser.status === 'inactive' && (
                  <button
                    onClick={() => handleUserAction(selectedUser._id, 'activate')}
                    disabled={processingAction === `${selectedUser._id}-activate`}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {processingAction === `${selectedUser._id}-activate` ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    {processingAction === `${selectedUser._id}-activate` ? 'Processing...' : 'Activate User'}
                  </button>
                )}
                {selectedUser.status === 'active' && (
                  <button
                    onClick={() => handleUserAction(selectedUser._id, 'suspend')}
                    disabled={processingAction === `${selectedUser._id}-suspend`}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {processingAction === `${selectedUser._id}-suspend` ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserX className="w-4 h-4" />
                    )}
                    {processingAction === `${selectedUser._id}-suspend` ? 'Processing...' : 'Suspend User'}
                  </button>
                )}
                {selectedUser.status !== 'deleted' && (
                  <button
                    onClick={() => handleUserAction(selectedUser._id, 'delete')}
                    disabled={processingAction === `${selectedUser._id}-delete`}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {processingAction === `${selectedUser._id}-delete` ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {processingAction === `${selectedUser._id}-delete` ? 'Processing...' : 'Delete User'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
