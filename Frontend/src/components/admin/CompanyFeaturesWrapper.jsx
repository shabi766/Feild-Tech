import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Plus, 
  Trash2,
  Star,
  Settings,
  Users,
  Briefcase,
  Shield,
  Globe
} from 'lucide-react';

const CompanyFeaturesWrapper = () => {
  const [companyFeatures, setCompanyFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    category: 'general',
    isActive: true,
    priority: 'medium',
    icon: 'Settings'
  });

  useEffect(() => {
    fetchCompanyFeatures();
  }, []);

  const fetchCompanyFeatures = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFeatures = [
        {
          id: 1,
          name: 'Advanced Analytics',
          description: 'Comprehensive analytics and reporting capabilities',
          category: 'analytics',
          isActive: true,
          priority: 'high',
          icon: 'BarChart3',
          createdAt: '2024-01-15',
          usageCount: 1250
        },
        {
          id: 2,
          name: 'Multi-User Support',
          description: 'Support for multiple users and role-based access',
          category: 'user-management',
          isActive: true,
          priority: 'high',
          icon: 'Users',
          createdAt: '2024-01-10',
          usageCount: 890
        },
        {
          id: 3,
          name: 'API Integration',
          description: 'RESTful API for third-party integrations',
          category: 'integration',
          isActive: true,
          priority: 'medium',
          icon: 'Globe',
          createdAt: '2024-01-05',
          usageCount: 456
        },
        {
          id: 4,
          name: 'Advanced Security',
          description: 'Enhanced security features and encryption',
          category: 'security',
          isActive: false,
          priority: 'high',
          icon: 'Shield',
          createdAt: '2024-01-01',
          usageCount: 0
        }
      ];
      setCompanyFeatures(mockFeatures);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company features:', error);
      setLoading(false);
    }
  };

  const handleCreateFeature = async () => {
    try {
      // Mock API call - replace with actual implementation
      const featureToCreate = {
        ...newFeature,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        usageCount: 0
      };
      
      setCompanyFeatures([...companyFeatures, featureToCreate]);
      setNewFeature({ name: '', description: '', category: 'general', isActive: true, priority: 'medium', icon: 'Settings' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating feature:', error);
    }
  };

  const handleEditFeature = async (featureId) => {
    try {
      // Mock API call - replace with actual implementation
      const updatedFeatures = companyFeatures.map(feature => 
        feature.id === featureId ? { ...feature, ...editingFeature } : feature
      );
      setCompanyFeatures(updatedFeatures);
      setEditingFeature(null);
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        // Mock API call - replace with actual implementation
        const updatedFeatures = companyFeatures.filter(feature => feature.id !== featureId);
        setCompanyFeatures(updatedFeatures);
      } catch (error) {
        console.error('Error deleting feature:', error);
      }
    }
  };

  const handleToggleFeature = async (featureId) => {
    try {
      const updatedFeatures = companyFeatures.map(feature => 
        feature.id === featureId ? { ...feature, isActive: !feature.isActive } : feature
      );
      setCompanyFeatures(updatedFeatures);
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      Settings: Settings,
      Users: Users,
      Briefcase: Briefcase,
      Shield: Shield,
      Globe: Globe,
      Star: Star
    };
    return iconMap[iconName] || Settings;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'analytics': return 'bg-blue-100 text-blue-800';
      case 'user-management': return 'bg-purple-100 text-purple-800';
      case 'integration': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Features Management</h1>
          <p className="text-gray-600">Manage and configure company features and capabilities</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Features</p>
                <p className="text-2xl font-bold text-gray-900">{companyFeatures.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Features</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyFeatures.filter(f => f.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyFeatures.filter(f => f.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyFeatures.reduce((sum, f) => sum + f.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Feature Controls</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Feature</span>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyFeatures.map((feature) => {
            const IconComponent = getIconComponent(feature.icon);
            
            return (
              <div key={feature.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                      <div className="flex space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(feature.category)}`}>
                          {feature.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleFeature(feature.id)}
                      className={`p-1 rounded transition-colors ${
                        feature.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={feature.isActive ? 'Disable Feature' : 'Enable Feature'}
                    >
                      {feature.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingFeature(feature)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Feature"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Feature"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${feature.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Usage:</span>
                    <span className="font-medium text-gray-900">{feature.usageCount} times</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{feature.createdAt}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Feature ID:</span>
                    <span className="text-sm font-mono text-gray-600">#{feature.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {companyFeatures.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
            <p className="text-gray-600">Add your first company feature to get started</p>
          </div>
        )}

        {/* Create Feature Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Feature</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                  <input
                    type="text"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter feature name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter feature description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newFeature.category}
                    onChange={(e) => setNewFeature({...newFeature, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="analytics">Analytics</option>
                    <option value="user-management">User Management</option>
                    <option value="integration">Integration</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newFeature.priority}
                    onChange={(e) => setNewFeature({...newFeature, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature({...newFeature, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Settings">Settings</option>
                    <option value="Users">Users</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="Shield">Shield</option>
                    <option value="Globe">Globe</option>
                    <option value="Star">Star</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newFeature.isActive}
                    onChange={(e) => setNewFeature({...newFeature, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Enable feature by default
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFeature}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Feature Modal */}
        {editingFeature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Feature</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                  <input
                    type="text"
                    value={editingFeature.name}
                    onChange={(e) => setEditingFeature({...editingFeature, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingFeature.description}
                    onChange={(e) => setEditingFeature({...editingFeature, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingFeature.category}
                    onChange={(e) => setEditingFeature({...editingFeature, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="analytics">Analytics</option>
                    <option value="user-management">User Management</option>
                    <option value="integration">Integration</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingFeature.priority}
                    onChange={(e) => setEditingFeature({...editingFeature, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={editingFeature.icon}
                    onChange={(e) => setEditingFeature({...editingFeature, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Settings">Settings</option>
                    <option value="Users">Users</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="Shield">Shield</option>
                    <option value="Globe">Globe</option>
                    <option value="Star">Star</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editingFeature.isActive}
                    onChange={(e) => setEditingFeature({...editingFeature, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                    Enable feature
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingFeature(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditFeature(editingFeature.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyFeaturesWrapper;

