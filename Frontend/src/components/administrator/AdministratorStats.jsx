import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/UserContext';
import { ADMINISTRATION_API_END_POINT } from '../utils/constant';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  RefreshCw,
  Database,
  Server,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdministratorStats = () => {
  const { user, validateAuth } = useAuth();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKYC: 0,
    totalRevenue: 0
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [userDistribution, setUserDistribution] = useState([
    { role: 'Technician', count: 0 },
    { role: 'Recruiter', count: 0 },
    { role: 'Admin', count: 0 }
  ]);
  const [kycStatus, setKycStatus] = useState([
    { status: 'Verified', count: 0 },
    { status: 'Pending', count: 0 },
    { status: 'Rejected', count: 0 }
  ]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    uptime: '99.9%'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchStats = async () => {
    try {
      // Check if user is authenticated and is an admin
      if (!user || user.role !== 'Admin') {
        setError('Authentication required. Please log in as an administrator.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('Making API call to admin stats with user:', user.email);
      
      // First verify authentication status
      const isAuthValid = await validateAuth();
      if (!isAuthValid) {
        setError('Authentication expired. Please log in again.');
        setLoading(false);
        return;
      }
      console.log('Authentication verified successfully');
      
      const response = await axios.get(`${ADMINISTRATION_API_END_POINT}/stats?timeRange=${timeRange}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Update overview stats
        setStats({
          totalUsers: data.overview.totalUsers || 0,
          activeUsers: data.overview.activeUsers || 0,
          pendingKYC: data.kyc.pending || 0,
          totalRevenue: data.overview.totalRevenue || 0
        });

        // Update user distribution
        setUserDistribution([
          { role: 'Technician', count: data.users.technicians || 0 },
          { role: 'Recruiter', count: data.users.recruiters || 0 },
          { role: 'Admin', count: data.users.admins || 0 }
        ]);

        // Update KYC status
        setKycStatus([
          { status: 'Verified', count: data.kyc.verified || 0 },
          { status: 'Pending', count: data.kyc.pending || 0 },
          { status: 'Rejected', count: data.kyc.rejected || 0 }
        ]);

        // Update system health
        setSystemHealth({
          database: data.system.uptime > 95 ? 'healthy' : 'warning',
          api: 'healthy',
          storage: 'healthy',
          uptime: `${data.system.uptime}%`
        });

        // Update user growth data
        if (data.userGrowth && data.userGrowth.length > 0) {
          setUserGrowth(data.userGrowth);
        }

        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
      
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      setError(error.response?.data?.message || `Failed to fetch statistics (${error.response?.status || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  // Validate authentication when component mounts
  useEffect(() => {
    if (user) {
      validateAuth();
    }
  }, [user, validateAuth]);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Debug authentication info
  console.log('AdministratorStats - User auth state:', {
    user: user,
    isAdmin: user?.role === 'Admin',
    userId: user?._id,
    email: user?.email
  });

  if (loading && !lastUpdated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading statistics...</span>
        </div>
      </div>
      );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Statistics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="mb-4 text-sm text-gray-500">
            <p>User: {user?.email || 'Not authenticated'}</p>
            <p>Role: {user?.role || 'Unknown'}</p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time overview of platform statistics and system health
            {lastUpdated && (
              <span className="ml-2 text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending KYC</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64">
            <Line
              data={{
                labels: userGrowth.map(item => item.month) || [],
                datasets: [
                  {
                    label: 'New Users',
                    data: userGrowth.map(item => item.count) || [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* User Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: userDistribution.map(item => item.role) || [],
                datasets: [
                  {
                    data: userDistribution.map(item => item.count) || [],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(239, 68, 68, 0.8)',
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* KYC Status Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status Distribution</h3>
        <div className="h-64">
          <Doughnut
            data={{
              labels: kycStatus.map(item => item.status) || [],
              datasets: [
                {
                  data: kycStatus.map(item => item.count) || [],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>
      </motion.div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            {Object.entries(systemHealth).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {key === 'database' && <Database className="w-4 h-4 text-blue-600" />}
                  {key === 'api' && <Server className="w-4 h-4 text-green-600" />}
                  {key === 'storage' && <Shield className="w-4 h-4 text-purple-600" />}
                  {key === 'uptime' && <Activity className="w-4 h-4 text-indigo-600" />}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdministratorStats;
