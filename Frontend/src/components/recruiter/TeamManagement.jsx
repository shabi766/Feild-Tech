import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Crown,
  Star,
  Building,
  Mail,
  Phone,
  Calendar,
  Tag,
  Palette,
  Copy,
  Download,
  FileText,
  Key,
  Lock,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const TeamManagement = () => {
  const { user } = useSelector(store => store.auth);
  const [activeTab, setActiveTab] = useState('users');
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [modalType, setModalType] = useState('team'); // 'team', 'role', 'invite'
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCredentials, setShowCredentials] = useState({});
  const [bulkInviteData, setBulkInviteData] = useState('');
  
  // New state variables for editing and managing
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  // Role hierarchy constants
  const ROLE_LEVELS = {
    ADMIN: 10,
    MANAGER: 7,
    RECRUITER: 4
  };

  const ROLE_PERMISSIONS = {
    ADMIN: {
      canManageCompanySettings: true,
      canManageAllUsers: true,
      canManageAllRoles: true,
      canManageAllTeams: true,
      canAccessMainWallet: true,
      canCreateSubWallets: true,
      canTransferFunds: true,
      canViewAllFinancials: true,
      canCreateJobs: true,
      canEditJobs: true,
      canDeleteJobs: true,
      canAssignJobs: true,
      canViewAllJobs: true,
      canHireTechnicians: true,
      canPayTechnicians: true,
      canViewAuditLogs: true,
      canManageSystemSettings: true
    },
    MANAGER: {
      canManageCompanySettings: false,
      canManageAllUsers: true,
      canManageAllRoles: false,
      canManageAllTeams: true,
      canAccessMainWallet: true,
      canCreateSubWallets: true,
      canTransferFunds: true,
      canViewAllFinancials: true,
      canCreateJobs: true,
      canEditJobs: true,
      canDeleteJobs: false,
      canAssignJobs: true,
      canViewAllJobs: true,
      canHireTechnicians: true,
      canPayTechnicians: true,
      canViewAuditLogs: false,
      canManageSystemSettings: false
    },
    RECRUITER: {
      canManageCompanySettings: false,
      canManageAllUsers: false,
      canManageAllRoles: false,
      canManageAllTeams: false,
      canAccessMainWallet: false,
      canCreateSubWallets: false,
      canTransferFunds: false,
      canViewAllFinancials: false,
      canCreateJobs: true,
      canEditJobs: true,
      canDeleteJobs: false,
      canAssignJobs: true,
      canViewAllJobs: false,
      canHireTechnicians: true,
      canPayTechnicians: true,
      canViewAuditLogs: false,
      canManageSystemSettings: false
    }
  };

  // Check if current user is admin
  const isCurrentUserAdmin = () => {
    return user?.role === 'admin' || user?.roleLevel === ROLE_LEVELS.ADMIN;
  };

  // Check if current user is manager or admin
  const isCurrentUserManagerOrAdmin = () => {
    return isCurrentUserAdmin() || user?.role === 'manager' || user?.roleLevel === ROLE_LEVELS.MANAGER;
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, rolesRes, usersRes] = await Promise.all([
        api.get(`/teams/${user.companyId}`),
        api.get(`/roles/${user.companyId}`),
        api.get(`/company-users/${user.companyId}`)
      ]);

      setTeams(teamsRes.data.data || []);
      setRoles(rolesRes.data.data || []);
      setCompanyUsers(usersRes.data.data || []);
      
      // Ensure company owner has admin role
      await ensureCompanyOwnerHasAdminRole();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (modalType === 'team') {
        response = await api.post(`/teams/${user.companyId}`, formData);
        setTeams([...teams, response.data.data]);
        toast.success('Team created successfully');
      } else if (modalType === 'role') {
        // Auto-assign admin role to company owners
        if (user?.role === 'company_owner' || user?.isCompanyOwner) {
          formData.level = ROLE_LEVELS.ADMIN;
          formData.permissions = ROLE_PERMISSIONS.ADMIN;
          formData.roleType = 'ADMIN';
        }
        
        response = await api.post(`/roles/${user.companyId}`, formData);
        setRoles([...roles, response.data.data]);
        toast.success('Role created successfully');
      }
      
      setShowCreateModal(false);
      setFormData({});
      setModalType('team');
    } catch (error) {
      console.error('Error creating:', error);
      toast.error('Failed to create ' + modalType);
    }
  };

  // Auto-assign admin role to company owners
  const ensureCompanyOwnerHasAdminRole = async () => {
    if (user?.role === 'company_owner' || user?.isCompanyOwner) {
      try {
        // Check if admin role already exists
        const adminRoleExists = roles.some(role => 
          role.level === ROLE_LEVELS.ADMIN || role.name === 'Admin'
        );
        
        if (!adminRoleExists) {
          const adminRoleData = {
            name: 'Admin',
            description: 'Full system access for company owners',
            level: ROLE_LEVELS.ADMIN,
            color: '#DC2626',
            roleType: 'ADMIN',
            permissions: ROLE_PERMISSIONS.ADMIN
          };
          
          const response = await api.post(`/roles/${user.companyId}`, adminRoleData);
          setRoles([...roles, response.data.data]);
          toast.success('Admin role automatically created for company owner');
        }
      } catch (error) {
        console.error('Error creating admin role:', error);
      }
    }
  };

  // Team CRUD functions
  const handleEditTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/teams/${editingItem._id}`, formData);
      setTeams(teams.map(team => 
        team._id === editingItem._id ? response.data.data : team
      ));
      toast.success('Team updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${itemToDelete._id}`);
      setTeams(teams.filter(team => team._id !== itemToDelete._id));
      toast.success('Team deleted successfully');
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const openEditTeam = (team) => {
    setEditingItem(team);
    setFormData({
      name: team.name,
      description: team.description,
      maxMembers: team.maxMembers,
      color: team.color
    });
    setShowEditModal(true);
  };

  const openDeleteTeam = (team) => {
    setItemToDelete(team);
    setShowDeleteConfirm(true);
  };

  const openViewTeam = (team) => {
    setViewingItem(team);
    setShowViewModal(true);
  };

  // Role CRUD functions
  const handleEditRole = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/roles/${editingItem._id}`, formData);
      setRoles(roles.map(role => 
        role._id === editingItem._id ? response.data.data : role
      ));
      toast.success('Role updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    try {
      await api.delete(`/roles/${itemToDelete._id}`);
      setRoles(roles.filter(role => role._id !== itemToDelete._id));
      toast.success('Role deleted successfully');
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const openEditRole = (role) => {
    setEditingItem(role);
    setFormData({
      name: role.name,
      description: role.description,
      level: role.level,
      color: role.color,
      permissions: role.permissions || {}
    });
    setShowEditModal(true);
  };

  const openDeleteRole = (role) => {
    setItemToDelete(role);
    setShowDeleteConfirm(true);
  };

  const openViewRole = (role) => {
    setViewingItem(role);
    setShowViewModal(true);
  };

  // Company User CRUD functions
  const handleEditCompanyUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/company-users/${user.companyId}/${editingItem._id}`, formData);
      setCompanyUsers(companyUsers.map(cu => 
        cu._id === editingItem._id ? response.data.data : cu
      ));
      toast.success('User updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteCompanyUser = async () => {
    try {
      await api.delete(`/company-users/${user.companyId}/${itemToDelete._id}`);
      setCompanyUsers(companyUsers.filter(cu => cu._id !== itemToDelete._id));
      toast.success('User removed from company successfully');
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  const openEditCompanyUser = (companyUser) => {
    setEditingItem(companyUser);
    setFormData({
      roleId: companyUser.roleId?._id || '',
      status: companyUser.status,
      teamIds: companyUser.teams?.map(t => t.teamId?._id || t.teamId) || []
    });
    setShowEditModal(true);
  };

  const openDeleteCompanyUser = (companyUser) => {
    setItemToDelete(companyUser);
    setShowDeleteConfirm(true);
  };

  const openViewCompanyUser = (companyUser) => {
    setViewingItem(companyUser);
    setShowViewModal(true);
  };

  // Utility functions
  const refreshData = async () => {
    await fetchData();
    toast.success('Data refreshed successfully');
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  const exportData = () => {
    let dataToExport = [];
    let filename = '';
    
    if (activeTab === 'teams') {
      dataToExport = teams.map(team => ({
        Name: team.name,
        Description: team.description || '',
        'Max Members': team.maxMembers || 50,
        'Current Members': team.members?.length || 0,
        'Created Date': new Date(team.createdAt).toLocaleDateString()
      }));
      filename = 'teams_export.csv';
    } else if (activeTab === 'roles') {
      dataToExport = roles.map(role => ({
        Name: role.name,
        Description: role.description || '',
        Level: role.level,
        'Created Date': new Date(role.createdAt).toLocaleDateString()
      }));
      filename = 'roles_export.csv';
    } else if (activeTab === 'users') {
      dataToExport = companyUsers.map(cu => ({
        Name: cu.userId?.fullname || '',
        Email: cu.userId?.email || '',
        Role: cu.roleId?.name || 'No role',
        Status: cu.status,
        'Joined Date': new Date(cu.joinedAt).toLocaleDateString()
      }));
      filename = 'users_export.csv';
    }
    
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Convert to CSV
    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/company-users/${user.companyId}/invite`, {
        ...formData
      });
      
      setCompanyUsers([...companyUsers, response.data.data.companyUser]);
      setShowInviteModal(false);
      setFormData({});
      
      // Show credentials if new user was created
      if (response.data.data.isNewUser && response.data.data.credentials) {
        setShowCredentials({
          [response.data.data.user._id]: response.data.data.credentials
        });
        toast.success('User invited successfully! Credentials are displayed below.');
      } else {
        toast.success('User invited successfully!');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to invite user');
    }
  };

  const handleBulkInvite = async (e) => {
    e.preventDefault();
    try {
      // Parse CSV-like data
      const users = bulkInviteData.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [fullname, email, phoneNumber] = line.split(',').map(s => s.trim());
          return { fullname, email, phoneNumber };
        })
        .filter(user => user.fullname && user.email && user.phoneNumber);

      if (users.length === 0) {
        toast.error('Please enter valid user data');
        return;
      }

      const response = await api.post(`/company-users/${user.companyId}/bulk-invite`, {
        users
      });

      setShowBulkInviteModal(false);
      setBulkInviteData('');
      
      // Refresh data
      await fetchData();
      
      // Show results
      const { successful, errors } = response.data.data;
      if (successful.length > 0) {
        toast.success(`${successful.length} users invited successfully!`);
        
        // Show credentials for new users
        const newCredentials = {};
        successful.forEach(user => {
          if (user.credentials) {
            newCredentials[user.email] = user.credentials;
          }
        });
        setShowCredentials(newCredentials);
      }
      
      if (errors.length > 0) {
        toast.error(`${errors.length} invitations failed. Check console for details.`);
        console.log('Bulk invite errors:', errors);
      }
    } catch (error) {
      console.error('Error in bulk invite:', error);
      toast.error('Failed to process bulk invitations');
    }
  };

  const copyCredentials = (credentials) => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}\nLogin URL: ${credentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard!');
  };

  const downloadCredentials = (credentials, fullname) => {
    const text = `User Credentials for ${fullname}\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin URL: ${credentials.loginUrl}\n\nPlease provide these credentials to the user securely.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullname}_credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Credentials downloaded!');
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowCreateModal(true);
  };

  const openInviteModal = () => {
    setFormData({});
    setShowInviteModal(true);
  };

  const openBulkInviteModal = () => {
    setBulkInviteData('');
    setShowBulkInviteModal(true);
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = companyUsers.filter(user => {
    const matchesSearch = user.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600 mb-4">Manage your company teams, roles, and user permissions. Create accounts for team members with automatic role assignment.</p>
          
          {/* Role and Permission Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Your Role:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    isCurrentUserAdmin() ? 'bg-red-100 text-red-800' :
                    isCurrentUserManagerOrAdmin() ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {isCurrentUserAdmin() ? 'Admin' : 
                     isCurrentUserManagerOrAdmin() ? 'Manager' : 'Recruiter'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {isCurrentUserAdmin() ? 'Full system access - can manage everything' :
                   isCurrentUserManagerOrAdmin() ? 'Can manage teams, users, and financials' :
                   'Can create jobs and manage technicians'}
                </div>
              </div>
              
              {isCurrentUserAdmin() && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Company Owner</span> - You have full administrative privileges
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{companyUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'users', label: 'Users', icon: UserPlus },
                { id: 'teams', label: 'Teams', icon: Users },
                { id: 'roles', label: 'Roles', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                {/* Status Filter for Users */}
                {activeTab === 'users' && (
                  <select
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                )}
                
                {/* Utility Buttons */}
                <button
                  onClick={refreshData}
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                
                <button
                  onClick={exportData}
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Export data"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Clear filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Role-based access control for actions */}
                {activeTab === 'teams' && isCurrentUserManagerOrAdmin() && (
                  <button
                    onClick={() => openCreateModal('team')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </button>
                )}
                
                {activeTab === 'roles' && isCurrentUserAdmin() && (
                  <button
                    onClick={() => openCreateModal('role')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </button>
                )}
                
                {activeTab === 'users' && isCurrentUserManagerOrAdmin() && (
                  <>
                    <button
                      onClick={openInviteModal}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite User
                    </button>
                    <button
                      onClick={openBulkInviteModal}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Bulk Invite
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Credentials Display */}
                {Object.keys(showCredentials).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                      <Key className="h-5 w-5 mr-2" />
                      New User Credentials
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(showCredentials).map(([email, credentials]) => (
                        <div key={email} className="bg-white border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Credentials for {email}</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyCredentials(credentials)}
                                className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </button>
                              <button
                                onClick={() => downloadCredentials(credentials, email)}
                                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Email:</span>
                              <p className="text-gray-900 font-mono">{credentials.email}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Password:</span>
                              <p className="text-gray-900 font-mono">{credentials.password}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Login URL:</span>
                              <p className="text-gray-900 font-mono">{credentials.loginUrl}</p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Note:</strong> Share these credentials securely with the user. They can use these to login directly.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowCredentials({})}
                      className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Clear Credentials
                    </button>
                  </div>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((companyUser) => (
                        <tr key={companyUser._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                {companyUser.userId?.profile?.profilePhoto ? (
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={companyUser.userId.profile.profilePhoto}
                                    alt="Profile"
                                  />
                                ) : (
                                  <span className="text-gray-600 font-medium">
                                    {companyUser.userId?.fullname?.charAt(0) || 'U'}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {companyUser.userId?.fullname || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {companyUser.userId?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {companyUser.roleId ? (
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: companyUser.roleId.color || '#6B7280' }}
                                ></div>
                                <span className="text-sm text-gray-900">
                                  {companyUser.roleId.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No role assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {companyUser.teams?.slice(0, 2).map((teamInfo) => (
                                <span
                                  key={teamInfo.teamId}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {teamInfo.teamId?.name || 'Unknown Team'}
                                </span>
                              ))}
                              {companyUser.teams?.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                  +{companyUser.teams.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              companyUser.status === 'active' ? 'bg-green-100 text-green-800' :
                              companyUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              companyUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {companyUser.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {companyUser.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {companyUser.status === 'suspended' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {companyUser.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(companyUser.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openViewCompanyUser(companyUser)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View user details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {isCurrentUserManagerOrAdmin() && (
                                <button 
                                  onClick={() => openEditCompanyUser(companyUser)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit user"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {isCurrentUserManagerOrAdmin() && (
                                <button 
                                  onClick={() => openDeleteCompanyUser(companyUser)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remove user from company"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <div key={team._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: team.color || '#3B82F6' }}
                        ></div>
                        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openViewTeam(team)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View team details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isCurrentUserManagerOrAdmin() && (
                          <button 
                            onClick={() => openEditTeam(team)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit team"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {isCurrentUserManagerOrAdmin() && (
                          <button 
                            onClick={() => openDeleteTeam(team)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete team"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{team.description || 'No description'}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {team.members?.length || 0} members
                      </div>
                      <div className="text-sm text-gray-500">
                        Max: {team.maxMembers || 50}
                      </div>
                    </div>

                    {team.tags && team.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {team.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map((role) => (
                  <div key={role._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: role.color || '#6B7280' }}
                        ></div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full mr-2">
                          Level {role.level}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openViewRole(role)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View role details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isCurrentUserAdmin() && (
                            <button 
                              onClick={() => openEditRole(role)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Edit role"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {isCurrentUserAdmin() && (
                            <button 
                              onClick={() => openDeleteRole(role)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{role.description || 'No description'}</p>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Key Permissions:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(role.permissions || {}).slice(0, 6).map(([key, value]) => (
                          <div key={key} className="flex items-center text-xs">
                            {value ? (
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-gray-300 mr-1" />
                            )}
                            <span className="text-gray-600">
                              {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Created {new Date(role.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create {modalType === 'team' ? 'Team' : 'Role'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate}>
              {modalType === 'team' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter team description"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.maxMembers || ''}
                      onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color || '#3B82F6'}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter role name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter role description"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.level || ''}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher levels have more permissions
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color || '#6B7280'}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Permissions Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role Type
                    </label>
                    <select
                      value={formData.roleType || ''}
                      onChange={(e) => {
                        const roleType = e.target.value;
                        setFormData({
                          ...formData,
                          roleType,
                          level: roleType ? ROLE_LEVELS[roleType] : '',
                          permissions: roleType ? ROLE_PERMISSIONS[roleType] : {}
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Role Type</option>
                      <option value="ADMIN">Admin - Full System Access</option>
                      <option value="MANAGER">Manager - Team & Financial Management</option>
                      <option value="RECRUITER">Recruiter - Job & Hiring Management</option>
                      <option value="CUSTOM">Custom - Define Your Own</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a predefined role or create a custom one
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    
                    {/* Company Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Company Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canManageCompanySettings', 'canManageAllUsers', 'canManageAllRoles', 'canManageAllTeams'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Financial Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Financial Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canAccessMainWallet', 'canCreateSubWallets', 'canTransferFunds', 'canViewAllFinancials'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Job Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Job Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canCreateJobs', 'canEditJobs', 'canDeleteJobs', 'canAssignJobs', 'canViewAllJobs'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Team Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Team Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canCreateTeams', 'canEditTeams', 'canDeleteTeams', 'canManageTeamMembers', 'canInviteUsers', 'canRemoveUsers'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Technician Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Technician Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canHireTechnicians', 'canPayTechnicians'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* System Access */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">System Access</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canViewAuditLogs', 'canManageSystemSettings'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create {modalType === 'team' ? 'Team' : 'Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditModal(false);
            setEditingItem(null);
            setFormData({});
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit {editingItem?.name || 'Item'}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={
              activeTab === 'teams' ? handleEditTeam : 
              activeTab === 'roles' ? handleEditRole : 
              handleEditCompanyUser
            }>
              {activeTab === 'teams' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter team description"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.maxMembers || ''}
                      onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color || '#3B82F6'}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              ) : activeTab === 'roles' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter role name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter role description"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.level || ''}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color || '#6B7280'}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Permissions Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role Type
                    </label>
                    <select
                      value={formData.roleType || ''}
                      onChange={(e) => {
                        const roleType = e.target.value;
                        setFormData({
                          ...formData,
                          roleType,
                          level: roleType ? ROLE_LEVELS[roleType] : '',
                          permissions: roleType ? ROLE_PERMISSIONS[roleType] : {}
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Role Type</option>
                      <option value="ADMIN">Admin - Full System Access</option>
                      <option value="MANAGER">Manager - Team & Financial Management</option>
                      <option value="RECRUITER">Recruiter - Job & Hiring Management</option>
                      <option value="CUSTOM">Custom - Define Your Own</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a predefined role or create a custom one
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    
                    {/* Company Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Company Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canManageCompanySettings', 'canManageAllUsers', 'canManageAllRoles', 'canManageAllTeams'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Financial Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Financial Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canAccessMainWallet', 'canCreateSubWallets', 'canTransferFunds', 'canViewAllFinancials'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Job Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Job Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canCreateJobs', 'canEditJobs', 'canDeleteJobs', 'canAssignJobs', 'canViewAllJobs'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Team Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Team Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canCreateTeams', 'canEditTeams', 'canDeleteTeams', 'canManageTeamMembers', 'canInviteUsers', 'canRemoveUsers'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Technician Management */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Technician Management</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canHireTechnicians', 'canPayTechnicians'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* System Access */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">System Access</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {['canViewAuditLogs', 'canManageSystemSettings'].map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions?.[permission] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [permission]: e.target.checked
                                }
                              })}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      required
                      value={formData.roleId || ''}
                      onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name} (Level {role.level})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      required
                      value={formData.status || ''}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teams
                    </label>
                    <select
                      multiple
                      value={formData.teamIds || []}
                      onChange={(e) => setFormData({...formData, teamIds: Array.from(e.target.selectedOptions, option => option.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple teams</p>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{itemToDelete?.name || 'this item'}</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={
                  activeTab === 'teams' ? handleDeleteTeam : 
                  activeTab === 'roles' ? handleDeleteRole : 
                  handleDeleteCompanyUser
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowViewModal(false);
            setViewingItem(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'teams' ? 'Team Details' : 
                 activeTab === 'roles' ? 'Role Details' : 'User Details'}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingItem(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {activeTab === 'teams' && viewingItem && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: viewingItem.color || '#3B82F6' }}
                  ></div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingItem.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-900">{viewingItem.description || 'No description provided'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Max Members</h4>
                    <p className="text-gray-900">{viewingItem.maxMembers || 50}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Current Members</h4>
                    <p className="text-gray-900">{viewingItem.members?.length || 0}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Created</h4>
                    <p className="text-gray-900">{new Date(viewingItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {viewingItem.tags && viewingItem.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingItem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingItem.members && viewingItem.members.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Team Members</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewingItem.members.map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.userId?.fullname?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.userId?.fullname || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'roles' && viewingItem && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: viewingItem.color || '#6B7280' }}
                  ></div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingItem.name}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    Level {viewingItem.level}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-900">{viewingItem.description || 'No description provided'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Created</h4>
                    <p className="text-gray-900">{new Date(viewingItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {viewingItem.permissions && Object.keys(viewingItem.permissions).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(viewingItem.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300" />
                          )}
                          <span className="text-sm text-gray-700">
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'users' && viewingItem && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    {viewingItem.userId?.profile?.profilePhoto ? (
                      <img
                        className="w-16 h-16 rounded-full"
                        src={viewingItem.userId.profile.profilePhoto}
                        alt="Profile"
                      />
                    ) : (
                      <span className="text-2xl font-medium text-gray-600">
                        {viewingItem.userId?.fullname?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{viewingItem.userId?.fullname || 'Unknown User'}</h3>
                    <p className="text-gray-500">{viewingItem.userId?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Phone Number</h4>
                    <p className="text-gray-900">{viewingItem.userId?.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      viewingItem.status === 'active' ? 'bg-green-100 text-green-800' :
                      viewingItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      viewingItem.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingItem.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Role</h4>
                    {viewingItem.roleId ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: viewingItem.roleId.color || '#6B7280' }}
                        ></div>
                        <span className="text-gray-900">{viewingItem.roleId.name} (Level {viewingItem.roleId.level})</span>
                      </div>
                    ) : (
                      <p className="text-gray-500">No role assigned</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Joined</h4>
                    <p className="text-gray-900">{new Date(viewingItem.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {viewingItem.teams && viewingItem.teams.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Teams</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewingItem.teams.map((teamInfo, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: teamInfo.teamId?.color || '#3B82F6' }}
                          ></div>
                          <span className="font-medium text-gray-900">{teamInfo.teamId?.name || 'Unknown Team'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingItem.roleId?.permissions && Object.keys(viewingItem.roleId.permissions).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Role Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(viewingItem.roleId.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300" />
                          )}
                          <span className="text-sm text-gray-700">
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invite User to Company</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullname || ''}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Selection
                </label>
                <select
                  required
                  value={formData.roleId || ''}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role for this user</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name} (Level {role.level})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a role to define the user's permission levels
                </p>
              </div>

              {/* Role Permissions Preview */}
              {formData.roleId && (() => {
                const selectedRole = roles.find(r => r._id === formData.roleId);
                return selectedRole ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      {selectedRole.name} Permissions Preview:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(selectedRole.permissions || {}).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          {value ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-gray-300 mr-1" />
                          )}
                          <span className="text-blue-700">
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {Object.keys(selectedRole.permissions || {}).length > 8 && (
                      <p className="text-xs text-blue-600 mt-2">
                        +{Object.keys(selectedRole.permissions || {}).length - 8} more permissions
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teams (Optional)
                </label>
                <select
                  multiple
                  value={formData.teamIds || []}
                  onChange={(e) => setFormData({...formData, teamIds: Array.from(e.target.selectedOptions, option => option.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple teams</p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Invite Modal */}
      {showBulkInviteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBulkInviteModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Bulk Invite Users</h2>
              <button
                onClick={() => setShowBulkInviteModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleBulkInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Data
                </label>
                <textarea
                  required
                  value={bulkInviteData}
                  onChange={(e) => setBulkInviteData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="8"
                  placeholder="John Doe, john@example.com, +1234567890&#10;Jane Smith, jane@example.com, +0987654321&#10;Mike Johnson, mike@example.com, +1122334455"
                />
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Enter user information in the format: <strong>Full Name, Email, Phone Number</strong>
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Each user should be on a new line. Note: Roles will need to be assigned individually after invitation.
                </p>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800 mb-1">Role Hierarchy System:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li><strong>Admin:</strong> Full system access, can manage everything</li>
                    <li><strong>Manager:</strong> Can manage teams, users, and access company wallet</li>
                    <li><strong>Recruiter:</strong> Can create jobs, hire technicians, use sub-wallets</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBulkInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Process Bulk Invitations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
