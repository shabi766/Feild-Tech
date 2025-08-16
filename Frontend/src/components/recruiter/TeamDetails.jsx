import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Users, 
  UserPlus, 
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
  AlertCircle
} from 'lucide-react';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [newMemberData, setNewMemberData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/details/${teamId}`);
      setTeam(response.data.data);
      setEditData({
        name: response.data.data.name,
        description: response.data.data.description,
        maxMembers: response.data.data.maxMembers,
        color: response.data.data.color
      });
    } catch (error) {
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/teams/${teamId}`, editData);
      setTeam(response.data.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/teams/${teamId}/members`, newMemberData);
      setTeam(response.data.data);
      setShowAddMemberModal(false);
      setNewMemberData({});
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await api.delete(`/teams/${teamId}/members/${userId}`);
        setTeam(response.data.data);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const filteredMembers = team?.members?.filter(member => 
    member.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Team not found</p>
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
                style={{ backgroundColor: team.color || '#3B82F6' }}
              ></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
                <p className="text-gray-600 text-lg">{team.description || 'No description'}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Team
              </button>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{team.members?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {team.members?.filter(m => m.role === 'Manager').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {team.members?.filter(m => m.isActive).length || 0}
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
                <p className="text-sm font-medium text-gray-600">Max Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{team.maxMembers || 50}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                  <p className="text-sm text-gray-900">
                    {team.teamLead ? 'Assigned' : 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: team.color || '#3B82F6' }}
                    ></div>
                    <span className="text-sm text-gray-900">{team.color || '#3B82F6'}</span>
                  </div>
                </div>
                
                {team.tags && team.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {team.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow Member Invites</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    team.settings?.allowMemberInvites ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.settings?.allowMemberInvites ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Require Approval</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    team.settings?.requireApprovalForJoining ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.settings?.requireApprovalForJoining ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Public Visibility</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    team.settings?.allowPublicVisibility ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.settings?.allowPublicVisibility ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMembers.map((member) => (
                      <div key={member.userId._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              {member.userId.profile?.profilePhoto ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={member.userId.profile.profilePhoto}
                                  alt="Profile"
                                />
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  {member.userId.fullname?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.userId.fullname}</h4>
                              <p className="text-sm text-gray-500">{member.userId.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {member.role === 'Manager' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              member.role === 'Manager' ? 'bg-yellow-100 text-yellow-800' :
                              member.role === 'Member' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveMember(member.userId._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">No members found</p>
                    <p className="text-sm">Add members to your team to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Team</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={editData.name || ''}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  value={editData.maxMembers || ''}
                  onChange={(e) => setEditData({...editData, maxMembers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={editData.color || '#3B82F6'}
                  onChange={(e) => setEditData({...editData, color: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
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

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Team Member</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  required
                  value={newMemberData.userId || ''}
                  onChange={(e) => setNewMemberData({...newMemberData, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user ID"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newMemberData.role || 'Member'}
                  onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;
