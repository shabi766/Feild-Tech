import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Shield, 
  Users, 
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Plus, 
  X, 
  Crown, 
  Star,
  Calendar,
  Tag,
  Palette,
  ArrowLeft,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Briefcase,
  FileText,
  Building,
  DollarSign,
  BarChart3,
  UserPlus
} from 'lucide-react';

const RoleDetails = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [usersWithRole, setUsersWithRole] = useState([]);

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails();
      fetchUsersWithRole();
    }
  }, [roleId]);

  const fetchRoleDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/roles/details/${roleId}`);
      setRole(response.data.data);
      setEditData({
        name: response.data.data.name,
        description: response.data.data.description,
        level: response.data.data.level,
        color: response.data.data.color,
        permissions: response.data.data.permissions || {}
      });
    } catch (error) {
      console.error('Error fetching role details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersWithRole = async () => {
    try {
      const response = await api.get(`/roles/${roleId}/users`);
      setUsersWithRole(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users with role:', error);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/roles/${roleId}`, editData);
      setRole(response.data.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handlePermissionChange = (permission, value) => {
    setEditData({
      ...editData,
      permissions: {
        ...editData.permissions,
        [permission]: value
      }
    });
  };

  const permissionCategories = {
    'Job Management': [
      'canCreateJobs', 'canEditJobs', 'canDeleteJobs', 'canAssignJobs', 'canViewAllJobs'
    ],
    'Team Management': [
      'canCreateTeams', 'canEditTeams', 'canDeleteTeams', 'canManageTeamMembers', 'canInviteUsers', 'canRemoveUsers'
    ],
    'Project Management': [
      'canCreateProjects', 'canEditProjects', 'canDeleteProjects', 'canAssignProjects', 'canViewAllProjects'
    ],
    'Client Management': [
      'canCreateClients', 'canEditClients', 'canDeleteClients', 'canViewAllClients'
    ],
    'Financial Management': [
      'canViewBudget', 'canManageBudget', 'canViewInvoices', 'canCreateInvoices', 'canApprovePayments'
    ],
    'Reports & Analytics': [
      'canViewReports', 'canGenerateReports', 'canExportData'
    ],
    'User Management': [
      'canViewUsers', 'canEditUsers', 'canDeleteUsers', 'canChangeUserRoles'
    ],
    'System Settings': [
      'canManageCompanySettings', 'canManageIntegrations', 'canViewAuditLogs'
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role details...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Role not found</p>
        <button
          onClick={() => navigate('/app/recruiter/team-management')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Team Management
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/recruiter/team-management')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team Management
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-4"
                style={{ backgroundColor: role.color || '#6B7280' }}
              ></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{role.name}</h1>
                <p className="text-gray-600 text-lg">{role.description || 'No description'}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </button>
            </div>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Role Level</p>
                <p className="text-2xl font-bold text-gray-900">{role.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users with Role</p>
                <p className="text-2xl font-bold text-gray-900">{usersWithRole.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Permissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(role.permissions || {}).filter(Boolean).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(role.permissions || {}).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Role Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(role.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: role.color || '#6B7280' }}
                    ></div>
                    <span className="text-sm text-gray-900">{role.color || '#6B7280'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    role.isSystemRole ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {role.isSystemRole ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Users with this Role */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Users with this Role</h3>
              
              {usersWithRole.length > 0 ? (
                <div className="space-y-3">
                  {usersWithRole.slice(0, 5).map((companyUser) => (
                    <div key={companyUser._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        {companyUser.userId?.profile?.profilePhoto ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={companyUser.userId.profile.profilePhoto}
                            alt="Profile"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium text-sm">
                            {companyUser.userId?.fullname?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {companyUser.userId?.fullname || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {companyUser.userId?.email || 'No email'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        companyUser.status === 'active' ? 'bg-green-100 text-green-800' :
                        companyUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {companyUser.status}
                      </span>
                    </div>
                  ))}
                  {usersWithRole.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{usersWithRole.length - 5} more users
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No users assigned to this role yet
                </p>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage what users with this role can access and modify
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        {category === 'Job Management' && <Briefcase className="h-4 w-4 mr-2" />}
                        {category === 'Team Management' && <Users className="h-4 w-4 mr-2" />}
                        {category === 'Project Management' && <FileText className="h-4 w-4 mr-2" />}
                        {category === 'Client Management' && <Building className="h-4 w-4 mr-2" />}
                        {category === 'Financial Management' && <DollarSign className="h-4 w-4 mr-2" />}
                        {category === 'Reports & Analytics' && <BarChart3 className="h-4 w-4 mr-2" />}
                        {category === 'User Management' && <UserPlus className="h-4 w-4 mr-2" />}
                        {category === 'System Settings' && <Settings className="h-4 w-4 mr-2" />}
                        {category}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {role.permissions?.[permission] ? (
                                <Unlock className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span className="text-sm text-gray-700">
                                {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={role.permissions?.[permission] || false}
                                disabled
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Role</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditRole}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.name || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editData.level || ''}
                    onChange={(e) => setEditData({...editData, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={editData.color || '#6B7280'}
                  onChange={(e) => setEditData({...editData, color: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Permissions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                <div className="space-y-4">
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editData.permissions?.[permission] || false}
                                onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDetails;
