import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  FileText,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Target,
  Award,
  MapPin,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IndividualRecruiterDashboard = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    totalApplicants: 0,
    unreadMessages: 0,
    upcomingDeadlines: 0,
    averageRating: 0,
    totalProjects: 0
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real dashboard data for individual recruiter
      const response = await api.get(`/dashboard/individual-recruiter/${user?._id}/stats`);
      if (response.data.success) {
        setStats(response.data.stats || {});
        setRecentJobs(response.data.recentJobs || []);
        setRecentApplicants(response.data.recentApplicants || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0,
        pendingPayments: 0,
        totalApplicants: 0,
        unreadMessages: 0,
        upcomingDeadlines: 0,
        averageRating: 0,
        totalProjects: 0
      });
      setRecentJobs([]);
      setRecentApplicants([]);
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

  const ProfileSummary = () => (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user?.fullname || 'Recruiter'}</h2>
          <p className="text-gray-600">Individual Recruiter</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-600">{user?.location || 'Location not set'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-600">{user?.phoneNumber || 'Phone not set'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-600">{stats.averageRating}/5 Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Projects</span>
            <span className="text-sm font-bold text-gray-900">{stats.totalProjects}</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Success Rate</span>
            <span className="text-sm font-bold text-gray-900">
              {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
            </span>
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
          onClick={() => navigate('/app/recruiter/simple-post-job')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Plus className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Post Job</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/technicians/techs')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          <Users className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-green-900">Find Talent</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/jobs')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <Briefcase className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">My Jobs</span>
        </button>
        <button 
          onClick={() => navigate('/app/recruiter/messages')}
          className="flex flex-col items-center space-y-2 p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
        >
          <MessageSquare className="h-6 w-6 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Messages</span>
        </button>
      </div>
    </div>
  );

  const RecentJobs = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
      <div className="space-y-4">
        {recentJobs.length > 0 ? (
          recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.description?.substring(0, 60)}...</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{job.deadline}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${job.budget}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{job.applicants || 0} applicants</span>
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                job.status === 'Active' ? 'bg-green-100 text-green-800' : 
                job.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No jobs posted yet</p>
            <p className="text-sm">Start by posting your first job to find great talent!</p>
            <button 
              onClick={() => navigate('/app/recruiter/simple-post-job')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const RecentApplicants = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applicants</h3>
      <div className="space-y-4">
        {recentApplicants.length > 0 ? (
          recentApplicants.map((applicant) => (
            <div key={applicant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {applicant.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{applicant.name}</h4>
                <p className="text-sm text-gray-600">{applicant.position}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{applicant.experience}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{applicant.rating}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                applicant.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                applicant.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                applicant.status === 'Hired' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {applicant.status}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No applicants yet</p>
            <p className="text-sm">Applicants will appear here once you post jobs</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Individual Recruiter Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullname}. Here's your recruiting overview.</p>
        </div>

        {/* Profile Summary */}
        <div className="mb-8">
          <ProfileSummary />
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
            title="Total Earnings"
            value={`$${stats.totalEarnings?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="bg-emerald-500"
            subtitle="This year"
          />
          <StatCard
            title="Pending Payments"
            value={`$${stats.pendingPayments?.toLocaleString() || '0'}`}
            icon={AlertCircle}
            color="bg-orange-500"
            subtitle="Awaiting payment"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Applicants"
            value={stats.totalApplicants}
            icon={Users}
            color="bg-purple-500"
            subtitle="All time"
          />
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages}
            icon={MessageSquare}
            color="bg-indigo-500"
            subtitle="Require attention"
          />
          <StatCard
            title="Upcoming Deadlines"
            value={stats.upcomingDeadlines}
            icon={Target}
            color="bg-red-500"
            subtitle="This week"
          />
        </div>

        {/* Quick Actions and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QuickActions />
          <RecentJobs />
        </div>

        {/* Recent Applicants */}
        <div className="mb-8">
          <RecentApplicants />
        </div>
      </div>
    </div>
  );
};

export default IndividualRecruiterDashboard;
