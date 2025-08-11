import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Briefcase, 
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This would be an actual API call to get all users
      // const response = await axios.get(`${USER_API_END_POINT}/admin/users`, { withCredentials: true });
      
      // Mock data for now
      const mockData = [
        {
          id: 1,
          fullname: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          role: 'Technician',
          status: 'active',
          kycStatus: 'verified',
          walletStatus: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: '2024-01-15T10:30:00Z',
          profile: {
            address: '123 Main St, City, Country',
            skills: ['Electrical', 'Plumbing', 'HVAC'],
            experience: '5 years',
            rating: 4.8
          }
        },
        {
          id: 2,
          fullname: 'Jane Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+1234567891',
          role: 'Client',
          status: 'active',
          kycStatus: 'pending',
          walletStatus: 'pending',
          createdAt: '2024-01-02T00:00:00Z',
          lastLogin: '2024-01-14T15:45:00Z',
          profile: {
            address: '456 Oak Ave, Town, Country',
            company: 'Tech Solutions Inc',
            projects: 12
          }
        },
        {
          id: 3,
          fullname: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phoneNumber: '+1234567892',
          role: 'Recruiter',
          status: 'suspended',
          kycStatus: 'verified',
          walletStatus: 'suspended',
          createdAt: '2024-01-03T00:00:00Z',
          lastLogin: '2024-01-10T09:15:00Z',
          profile: {
            address: '789 Pine Rd, Village, Country',
            company: 'HR Solutions',
            employees: 25
          }
        }
      ];
      
      setUsers(mockData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      // This would be an actual API call to perform the action
      // await axios.put(`${USER_API_END_POINT}/admin/users/${userId}/${action}`, data, { withCredentials: true });
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: 'suspended' };
            case 'activate':
              return { ...user, status: 'active' };
            case 'changeRole':
              return { ...user, role: data.role };
            case 'delete':
              return null;
            default:
              return user;
          }
        }
        return user;
      }).filter(Boolean));
      
      setShowActions(null);
      console.log(`User ${action} performed for user ${userId}`);
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesRole && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Technician': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Client': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Recruiter': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage all user accounts and permissions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="Technician">Technician</option>
            <option value="Client">Client</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
          
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            More Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
          { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: 'bg-green-500' },
          { label: 'Suspended Users', value: users.filter(u => u.status === 'suspended').length, color: 'bg-red-500' },
          { label: 'KYC Pending', value: users.filter(u => u.kycStatus === 'pending').length, color: 'bg-amber-500' }
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
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.fullname.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getKYCStatusColor(user.kycStatus)}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.walletStatus)}`}>
                      {user.walletStatus}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {showActions === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                                setShowActions(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                                setShowActions(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </button>
                            
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="flex items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 w-full text-left"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate User
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
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
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedUser.fullname}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedUser.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">KYC Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getKYCStatusColor(selectedUser.kycStatus)}`}>
                          {selectedUser.kycStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wallet Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.walletStatus)}`}>
                          {selectedUser.walletStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Information */}
                {selectedUser.profile && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedUser.profile.address}</span>
                        </div>
                        {selectedUser.profile.company && (
                          <div className="flex items-center space-x-3">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedUser.profile.company}</span>
                          </div>
                        )}
                        {selectedUser.profile.skills && (
                          <div className="flex items-center space-x-3">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedUser.profile.skills.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {selectedUser.profile.experience && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedUser.profile.experience}</span>
                          </div>
                        )}
                        {selectedUser.profile.rating && (
                          <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedUser.profile.rating}/5.0</span>
                          </div>
                        )}
                        {selectedUser.profile.projects && (
                          <div className="flex items-center space-x-3">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedUser.profile.projects} projects</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  
                  <button
                    onClick={() => {
                      // Implement edit functionality
                      console.log('Edit user:', selectedUser.id);
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit User
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

export default UserManagement;
