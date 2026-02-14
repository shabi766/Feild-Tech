import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import {
  Users,
  Briefcase,
  Building,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target,
  BarChart3,
  Globe,
  Award,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../ui/StatCard';
import { EmptyState } from '../ui/EmptyState';
import { DashboardSkeleton } from '../ui/LoadingSkeleton';
import { GradientButton } from '../ui/GradientButton';

const AdminDashboard = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalClients: 0,
    totalTechnicians: 0,
    totalProjects: 0,
    revenue: 0,
    pendingApplications: 0,
    activeProjects: 0,
    totalRevenue: 0,
    averageRating: 0,
    projectSuccessRate: 0,
    unreadMessages: 0
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.companyId) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch real dashboard statistics for company
      const response = await api.get(`/dashboard/company/${user.companyId}/stats`);
      if (response.data.success) {
        const data = response.data;
        setStats(data.stats || {});
        setRecentJobs(data.recentJobs || []);
        setRecentProjects(data.recentProjects || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to empty stats
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalClients: 0,
        totalTechnicians: 0,
        totalProjects: 0,
        revenue: 0,
        pendingApplications: 0,
        activeProjects: 0,
        totalRevenue: 0,
        averageRating: 0,
        projectSuccessRate: 0,
        unreadMessages: 0
      });
      setRecentJobs([]);
      setRecentProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // StatCard is now imported from ui components

  const CompanyOverview = () => (
    <div className="card-glass p-6 animate-fade-in-up">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
          <Building className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Overview</h2>
          <p className="text-gray-600">Performance metrics and key indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Average Rating</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-gray-900">{stats.averageRating}/5</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Project Success Rate</span>
            <span className="text-sm font-bold text-gray-900">{stats.projectSuccessRate}%</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Projects</span>
            <span className="text-sm font-bold text-gray-900">{stats.activeProjects}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="card-elevated p-6 animate-scale-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
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

  const RecentJobs = () => (
    <div className="card-elevated p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Job Postings</h3>
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
              <span className={`px-3 py-1 text-xs rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-800' :
                job.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {job.status}
              </span>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Start by posting your first job to find great talent!"
            action={
              <GradientButton
                onClick={() => navigate('/app/recruiter/post-job')}
                variant="gradient"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Post Your First Job
              </GradientButton>
            }
          />
        )}
      </div>
    </div>
  );

  const RecentProjects = () => (
    <div className="card-elevated p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Projects</h3>
      <div className="space-y-4">
        {recentProjects.length > 0 ? (
          recentProjects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600">{project.description?.substring(0, 60)}...</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{project.startDate}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{project.progress}% complete</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{project.teamSize} members</span>
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {project.status}
              </span>
            </div>
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="No projects yet"
            description="Projects will appear here once you start managing them"
          />
        )}
      </div>
    </div>
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.fullname}. Here's your company overview.</p>
        </div>

        {/* Company Overview */}
        <div className="mb-8">
          <CompanyOverview />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
            gradient="from-blue-500 to-indigo-600"
            subtitle="All time"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={Clock}
            gradient="from-green-500 to-emerald-600"
            subtitle="Currently open"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-green-600"
            subtitle="This year"
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon={AlertCircle}
            gradient="from-orange-500 to-red-600"
            subtitle="Require review"
          />
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages || 0}
            icon={MessageSquare}
            gradient="from-indigo-500 to-purple-600"
            subtitle="Require attention"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Technicians"
            value={stats.totalTechnicians}
            icon={Users}
            gradient="from-purple-500 to-pink-600"
            subtitle="Working with us"
          />
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FileText}
            gradient="from-indigo-500 to-blue-600"
            subtitle="All time"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Building}
            gradient="from-teal-500 to-cyan-600"
            subtitle="Served"
          />
        </div>

        {/* Quick Actions and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QuickActions />
          <RecentJobs />
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <RecentProjects />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
