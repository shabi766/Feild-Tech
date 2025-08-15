import React, { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, Search, Copy, Eye, Download } from 'lucide-react';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'job',
    content: '',
    tags: [],
    isPublic: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTemplates = [
        {
          id: 1,
          name: 'Software Development Job Template',
          description: 'Standard template for software development positions',
          category: 'job',
          content: 'We are looking for a skilled software developer...',
          tags: ['software', 'development', 'full-stack'],
          isPublic: true,
          usageCount: 45,
          createdAt: '2024-01-15',
          author: 'John Doe'
        },
        {
          id: 2,
          name: 'Project Proposal Template',
          description: 'Template for client project proposals',
          category: 'project',
          content: 'Project Overview:\nObjectives:\nTimeline:\nBudget:',
          tags: ['proposal', 'client', 'project'],
          isPublic: false,
          usageCount: 23,
          createdAt: '2024-01-10',
          author: 'Jane Smith'
        },
        {
          id: 3,
          name: 'Technical Interview Questions',
          description: 'Common technical interview questions for developers',
          category: 'interview',
          content: '1. Explain REST API principles\n2. What is OOP?\n3. Database design...',
          tags: ['interview', 'technical', 'questions'],
          isPublic: true,
          usageCount: 67,
          createdAt: '2024-01-05',
          author: 'Mike Johnson'
        }
      ];
      setTemplates(mockTemplates);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      // Mock API call - replace with actual implementation
      const templateToCreate = {
        ...newTemplate,
        id: Date.now(),
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        author: 'Current User'
      };
      
      setTemplates([...templates, templateToCreate]);
      setNewTemplate({ name: '', description: '', category: 'job', content: '', tags: [], isPublic: false });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEditTemplate = async (templateId) => {
    try {
      // Mock API call - replace with actual implementation
      const updatedTemplates = templates.map(template => 
        template.id === templateId ? { ...template, ...editingTemplate } : template
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        // Mock API call - replace with actual implementation
        const updatedTemplates = templates.filter(template => template.id !== templateId);
        setTemplates(updatedTemplates);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicateTemplate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Current User'
    };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Templates Management</h1>
          <p className="text-gray-600">Create and manage reusable templates for jobs, projects, and more</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="job">Job Templates</option>
                <option value="project">Project Templates</option>
                <option value="interview">Interview Templates</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.category === 'job' ? 'bg-green-100 text-green-800' :
                      template.category === 'project' ? 'bg-blue-100 text-blue-800' :
                      template.category === 'interview' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Template"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Duplicate Template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Template"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Author:</span>
                  <span className="font-medium text-gray-900">{template.author}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Usage:</span>
                  <span className="font-medium text-gray-900">{template.usageCount} times</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{template.createdAt}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Public:</span>
                  <span className={`font-medium ${template.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                    {template.isPublic ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Create your first template to get started</p>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Template</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter template description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="job">Job Template</option>
                    <option value="project">Project Template</option>
                    <option value="interview">Interview Template</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="8"
                    placeholder="Enter template content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newTemplate.tags.join(', ')}
                    onChange={(e) => setNewTemplate({...newTemplate, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTemplate.isPublic}
                    onChange={(e) => setNewTemplate({...newTemplate, isPublic: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this template public
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
                  onClick={handleCreateTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Template Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedTemplate.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTemplate.category === 'job' ? 'bg-green-100 text-green-800' :
                    selectedTemplate.category === 'project' ? 'bg-blue-100 text-blue-800' :
                    selectedTemplate.category === 'interview' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTemplate.category}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm">{selectedTemplate.content}</pre>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Author:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedTemplate.author}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Usage Count:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedTemplate.usageCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedTemplate.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Public:</span>
                    <span className={`ml-2 font-medium ${selectedTemplate.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedTemplate.isPublic ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleDuplicateTemplate(selectedTemplate)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    setEditingTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Template</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Template</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="job">Job Template</option>
                    <option value="project">Project Template</option>
                    <option value="interview">Interview Template</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingTemplate.tags.join(', ')}
                    onChange={(e) => setEditingTemplate({...editingTemplate, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editingTemplate.isPublic}
                    onChange={(e) => setEditingTemplate({...editingTemplate, isPublic: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-900">
                    Make this template public
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditTemplate(editingTemplate.id)}
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

export default Templates;

