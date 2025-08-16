import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import { 
  Building, 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Target,
  BarChart3,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyRecruiterDashboard = () => {
  const { user, isAuthenticated } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalTechnicians: 0,
    totalClients: 0,
    pendingApplications: 0,
    activeProjects: 0,
    completedProjects: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [companyMetrics, setCompanyMetrics] = useState({
    employeeCount: 0,
    foundedYear: '',
    industry: '',
    annualRevenue: '',
    clientSatisfaction: 0,
    projectSuccessRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      fetchCompanyData();
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timeout);
  }, [user, loading]);

  const fetchCompanyData = async () => {
    try {
      const response = await api.get(`/company/${user.companyId}/info`);
      
      if (response.data.success) {
        const company = response.data.company;
        setCompanyData(company);
        setCompanyMetrics({
          employeeCount: company.employeeCount || 0,
          foundedYear: company.foundedYear || '',
          industry: company.industry || '',
          annualRevenue: company.annualRevenue || '',
          clientSatisfaction: company.stats?.clientSatisfaction || 0,
          projectSuccessRate: company.stats?.projectSuccessRate || 0
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError('Failed to fetch company data');
      // Set default company data on error
      setCompanyData({
        name: 'Company Name',
        industry: 'Industry'
      });
      setCompanyMetrics({
        employeeCount: 0,
        foundedYear: '',
        industry: '',
        annualRevenue: '',
        clientSatisfaction: 0,
        projectSuccessRate: 0
      });
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get(`/dashboard/company/${user.companyId}/stats`);
      
      if (response.data.success) {
        const data = response.data;
        setStats(data.stats || {});
        setRecentJobs(data.recentJobs || []);
        setRecentApplications(data.recentProjects || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard stats');
      // Fallback to empty stats
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalTechnicians: 0,
        pendingApplications: 0,
        activeProjects: 0,
        completedProjects: 0
      });
      setRecentJobs([]);
      setRecentApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CompanyInfoCard = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-4">
           <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
             {companyData?.logo ? (
               <img 
                 src={companyData.logo} 
                 alt={`${companyData.name} logo`}
                 className="w-12 h-12 rounded-full object-cover"
               />
             ) : (
               <Building className="h-8 w-8 text-white" />
             )}
           </div>
           <div>
             <h2 className="text-2xl font-bold text-gray-900">{companyData?.name || 'Company Name'}</h2>
             <p className="text-gray-600">{companyData?.industry || 'Industry'}</p>
             {companyData?.description && (
               <p className="text-sm text-gray-500 mt-1">{companyData.description.substring(0, 100)}...</p>
             )}
           </div>
         </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>
      
      {/* User Position Bar */}
      <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Position</p>
              <p className="font-semibold text-gray-900">{user?.fullname || 'User'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-semibold text-blue-600">{companyData?.recruiters?.[0]?.position || user?.role || 'Recruiter'}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Founded: {companyData?.foundedYear || companyMetrics.foundedYear}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">{companyData?.employeeCount || companyMetrics.employeeCount} Employees</span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">{companyData?.annualRevenue || companyMetrics.annualRevenue}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Client Satisfaction</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-gray-900">{companyMetrics.clientSatisfaction}/5</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Project Success Rate</span>
            <span className="text-sm font-bold text-gray-900">{companyMetrics.projectSuccessRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => navigate('/app/recruiter/post-job')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Briefcase className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Post Job</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/technicians')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          <Users className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-green-900">Find Talent</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/projects')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <FileText className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Manage Projects</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/analytics')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
        >
          <BarChart3 className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Analytics</span>
        </button>
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Company Activity</h3>
      <div className="space-y-4">
                 {recentJobs && Array.isArray(recentJobs) && recentJobs.length > 0 ? (
           recentJobs.map((job) => (
            <div key={job._id || job.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    job.status === 'Complete' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{job.description?.substring(0, 100)}...</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {job.totalSalary && (
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${job.totalSalary?.toLocaleString()}</span>
                    </span>
                  )}
                  {job.startTime && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(job.startTime).toLocaleDateString()}</span>
                    </span>
                  )}
                  {job.endTime && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Due: {new Date(job.endTime).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No recent jobs posted</p>
            <p className="text-sm">Start posting jobs to see activity here</p>
            <button 
              onClick={() => navigate('/app/recruiter/post-job')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const CompanyProfileEditModal = () => {
    const [editData, setEditData] = useState({
      name: companyData?.name || '',
      industry: companyData?.industry || '',
      description: companyData?.description || '',
      foundedYear: companyData?.foundedYear || '',
      employeeCount: companyData?.employeeCount || '',
      annualRevenue: companyData?.annualRevenue || '',
      website: companyData?.website || '',
             address: {
         street: companyData?.address?.street || '',
         city: companyData?.address?.city || '',
         state: companyData?.address?.state || '',
         postalCode: companyData?.address?.postalCode || '',
         country: companyData?.address?.country || ''
       }
    });
    const [updating, setUpdating] = useState(false);

    // Update editData when companyData changes
    useEffect(() => {
      if (companyData) {
        setEditData({
          name: companyData.name || '',
          industry: companyData.industry || '',
          description: companyData.description || '',
          foundedYear: companyData.foundedYear || '',
          employeeCount: companyData.employeeCount || '',
          annualRevenue: companyData.annualRevenue || '',
          website: companyData.website || '',
                     address: {
             street: companyData.address?.street || '',
             city: companyData.address?.city || '',
             state: companyData.address?.state || '',
             postalCode: companyData.address?.postalCode || '',
             country: companyData.address?.country || ''
           }
        });
      }
    }, [companyData]);

    const handleInputChange = (field, value) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setEditData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else {
        setEditData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdating(true);
      try {
        const response = await api.put(`/company/${user.companyId}/update`, editData);
        if (response.data.success) {
          // Refresh company data
          await fetchCompanyData();
          setShowEditModal(false);
        }
      } catch (error) {
        console.error('Error updating company:', error);
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Company Profile</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={editData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                <input
                  type="text"
                  value={editData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                <input
                  type="text"
                  value={editData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
                <input
                  type="text"
                  value={editData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={editData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                  <input
                    type="text"
                    value={editData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                   <input
                     type="text"
                     value={editData.address.postalCode}
                     onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={editData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              if (user?.companyId) {
                fetchCompanyData();
                fetchDashboardStats();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullname}. Here's what's happening with your company.</p>
        </div>

                 {/* Company Information */}
         <div className="mb-8">
           <CompanyInfoCard />
         </div>

         {/* Company Details Section */}
         {companyData && (
           <div className="mb-8">
             <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
                   <div className="space-y-2">
                     {companyData.contact?.email && (
                       <div className="flex items-center space-x-2">
                         <Mail className="h-4 w-4 text-gray-400" />
                         <span className="text-sm text-gray-600">{companyData.contact.email}</span>
                       </div>
                     )}
                     {companyData.contact?.phone && (
                       <div className="flex items-center space-x-2">
                         <Phone className="h-4 w-4 text-gray-400" />
                         <span className="text-sm text-gray-600">{companyData.contact.phone}</span>
                       </div>
                     )}
                     {companyData.website && (
                       <div className="flex items-center space-x-2">
                         <Globe className="h-4 w-4 text-gray-400" />
                         <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                           {companyData.website}
                         </a>
                       </div>
                     )}
                   </div>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-700 mb-3">Address</h4>
                   <div className="space-y-2">
                     {companyData.address && (
                       <>
                         {companyData.address.street && (
                           <div className="flex items-center space-x-2">
                             <MapPin className="h-4 w-4 text-gray-400" />
                             <span className="text-sm text-gray-600">{companyData.address.street}</span>
                           </div>
                         )}
                         {(companyData.address.city || companyData.address.state || companyData.address.postalCode) && (
                           <div className="text-sm text-gray-600 ml-6">
                             {[companyData.address.city, companyData.address.state, companyData.address.postalCode].filter(Boolean).join(', ')}
                           </div>
                         )}
                         {companyData.address.country && (
                           <div className="text-sm text-gray-600 ml-6">{companyData.address.country}</div>
                         )}
                       </>
                     )}
                   </div>
                 </div>
               </div>
               {companyData.description && (
                 <div className="mt-6">
                   <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                   <p className="text-sm text-gray-600">{companyData.description}</p>
                 </div>
               )}

               {/* Company Additional Information */}
               <div className="mt-6 pt-6 border-t border-gray-200">
                 <h4 className="font-medium text-gray-700 mb-3">Additional Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {companyData.foundedYear && (
                     <div className="flex items-center space-x-2">
                       <Calendar className="h-4 w-4 text-gray-400" />
                       <span className="text-sm text-gray-600">Founded: {companyData.foundedYear}</span>
                     </div>
                   )}
                   {companyData.employeeCount && (
                     <div className="flex items-center space-x-2">
                       <Users className="h-4 w-4 text-gray-400" />
                       <span className="text-sm text-gray-600">{companyData.employeeCount} Employees</span>
                     </div>
                   )}
                   {companyData.annualRevenue && (
                     <div className="flex items-center space-x-2">
                       <DollarSign className="h-4 w-4 text-gray-400" />
                       <span className="text-sm text-gray-600">Revenue: {companyData.annualRevenue}</span>
                     </div>
                   )}
                   {companyData.companyType && (
                     <div className="flex items-center space-x-2">
                       <Building className="h-4 w-4 text-gray-400" />
                       <span className="text-sm text-gray-600">Type: {companyData.companyType}</span>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Company Team Section */}
         {companyData?.recruiters && Array.isArray(companyData.recruiters) && companyData.recruiters.length > 0 && (
           <div className="mb-8">
             <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Team</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {companyData.recruiters.map((recruiter, index) => (
                   <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                         <Users className="h-5 w-5 text-white" />
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">{recruiter.name || 'Recruiter'}</p>
                         <p className="text-sm text-gray-600">{recruiter.position || 'Position'}</p>
                         {recruiter.email && (
                           <p className="text-xs text-gray-500">{recruiter.email}</p>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* Current User Profile Section */}
         <div className="mb-8">
           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                   <Users className="h-6 w-6 text-white" />
                 </div>
                 <div>
                   <p className="text-sm text-gray-600">Name</p>
                   <p className="font-semibold text-gray-900">{user?.fullname || 'User'}</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                   <Briefcase className="h-6 w-6 text-white" />
                 </div>
                 <div>
                   <p className="text-sm text-gray-600">Position</p>
                                            <p className="font-semibold text-gray-900">{companyData?.recruiters?.[0]?.position || user?.role || 'Recruiter'}</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                   <Building className="h-6 w-6 text-white" />
                 </div>
                 <div>
                   <p className="text-sm text-gray-600">Company</p>
                   <p className="font-semibold text-gray-900">{companyData?.name || 'Company'}</p>
                 </div>
               </div>
             </div>
           </div>
         </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
            color="bg-blue-500"
            subtitle="All time"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={Clock}
            color="bg-green-500"
            subtitle="Currently open"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="bg-emerald-500"
            subtitle="This year"
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon={AlertCircle}
            color="bg-orange-500"
            subtitle="Require review"
          />
        </div>

                 {/* Additional Stats Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <StatCard
             title="Total Technicians"
             value={stats.totalTechnicians}
             icon={Users}
             color="bg-purple-500"
             subtitle="Working with us"
           />
           <StatCard
             title="Active Projects"
             value={stats.activeProjects}
             icon={Target}
             color="bg-indigo-500"
             subtitle="In progress"
           />
           <StatCard
             title="Client Satisfaction"
             value={`${companyMetrics.clientSatisfaction}/5`}
             icon={Star}
             color="bg-yellow-500"
             subtitle="Average rating"
           />
         </div>

         {/* Company Achievements Section */}
         <div className="mb-8">
           <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Achievements</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                 <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                 <p className="text-lg font-bold text-blue-900">{stats.totalJobs}</p>
                 <p className="text-sm text-blue-700">Total Jobs Posted</p>
               </div>
               <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                 <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                 <p className="text-lg font-bold text-green-900">{stats.completedJobs}</p>
                 <p className="text-sm text-green-700">Completed Jobs</p>
               </div>
               <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                 <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                 <p className="text-lg font-bold text-purple-900">{stats.projectSuccessRate || 0}%</p>
                 <p className="text-sm text-purple-700">Success Rate</p>
               </div>
               <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                 <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                 <p className="text-lg font-bold text-orange-900">${stats.totalRevenue?.toLocaleString() || '0'}</p>
                 <p className="text-sm text-orange-700">Total Revenue</p>
               </div>
             </div>
           </div>
         </div>

                 {/* Company Performance Metrics */}
         <div className="mb-8">
           <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <h4 className="font-medium text-gray-700 mb-3">Job Performance</h4>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Active Jobs</span>
                     <span className="font-semibold text-gray-900">{stats.activeJobs}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Completed Jobs</span>
                     <span className="font-semibold text-gray-900">{stats.completedJobs}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Success Rate</span>
                     <span className="font-semibold text-green-600">{stats.projectSuccessRate || 0}%</span>
                   </div>
                 </div>
               </div>
               <div>
                 <h4 className="font-medium text-gray-700 mb-3">Financial Overview</h4>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Total Revenue</span>
                     <span className="font-semibold text-green-600">${stats.totalRevenue?.toLocaleString() || '0'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Pending Applications</span>
                     <span className="font-semibold text-orange-600">{stats.pendingApplications}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Active Projects</span>
                     <span className="font-semibold text-blue-600">{stats.activeProjects}</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Quick Actions and Recent Activity */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <QuickActions />
           <RecentActivity />
         </div>

         {/* Recent Projects Section */}
         {recentApplications && Array.isArray(recentApplications) && recentApplications.length > 0 && (
           <div className="mb-8">
             <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
               <div className="space-y-4">
                 {recentApplications && Array.isArray(recentApplications) && recentApplications.map((project, index) => (
                   <div key={project._id || index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                     <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                     <div className="flex-1">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-medium text-gray-900">{project.title || `Project ${index + 1}`}</h4>
                         <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                           project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                           project.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {project.status || 'Active'}
                         </span>
                       </div>
                       <p className="text-sm text-gray-600 mb-2">{project.description?.substring(0, 100) || 'Project description...'}</p>
                       <div className="flex items-center space-x-4 text-xs text-gray-500">
                         {project.startTime && (
                           <span className="flex items-center space-x-1">
                             <Calendar className="h-3 w-3" />
                             <span>Started: {new Date(project.startTime).toLocaleDateString()}</span>
                           </span>
                         )}
                         {project.endTime && (
                           <span className="flex items-center space-x-1">
                             <Clock className="h-3 w-3" />
                             <span>Due: {new Date(project.endTime).toLocaleDateString()}</span>
                           </span>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

         {/* Footer Contact Section */}
         <div className="mt-12 pt-8 border-t border-gray-200">
           <div className="text-center">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
             <p className="text-gray-600 mb-4">Contact our support team for assistance with your company dashboard</p>
             <div className="flex items-center justify-center space-x-6">
               <div className="flex items-center space-x-2">
                 <Mail className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-600">support@company.com</span>
               </div>
               <div className="flex items-center space-x-2">
                 <Phone className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Company Profile Edit Modal */}
       {showEditModal && <CompanyProfileEditModal />}
     </div>
   );
};

export default CompanyRecruiterDashboard;