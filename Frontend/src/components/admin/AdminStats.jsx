import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Target,
  ClipboardList,
  Wrench,
  Shield,
  Wallet,
  Building,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import "chart.js/auto";
import axios from 'axios';
import { DASHBOARD_API_END_POINT } from '../utils/constant';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // This would be an actual API call to get admin stats
      // const response = await axios.get(`${DASHBOARD_API_END_POINT}/admin/stats?range=${timeRange}`, { withCredentials: true });
      
      // Mock data for now
      const mockStats = {
        overview: {
          totalUsers: 1247,
          activeUsers: 1189,
          totalJobs: 456,
          activeJobs: 89,
          totalRevenue: 125000,
          monthlyGrowth: 12.5
        },
        users: {
          technicians: 567,
          clients: 423,
          recruiters: 89,
          admins: 8,
          newUsers: 45,
          userGrowth: 8.2
        },
        kyc: {
          pending: 23,
          verified: 1124,
          rejected: 12,
          verificationRate: 98.9
        },
        financial: {
          totalTransactions: 2341,
          totalVolume: 125000,
          averageTransaction: 53.4,
          monthlyVolume: 45000
        },
        system: {
          uptime: 99.9,
          activeSessions: 234,
          serverLoad: 45,
          lastBackup: '2024-01-15T02:00:00Z'
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userDistributionData = {
    labels: ['Technicians', 'Clients', 'Recruiters', 'Admins'],
    datasets: [{
      data: [stats.users.technicians, stats.users.clients, stats.users.recruiters, stats.users.admins],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(147, 51, 234, 1)',
        'rgba(99, 102, 241, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const kycStatusData = {
    labels: ['Pending', 'Verified', 'Rejected'],
    datasets: [{
      data: [stats.kyc.pending, stats.kyc.verified, stats.kyc.rejected],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const monthlyGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'User Growth',
      data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Platform overview and analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: stats.overview.totalUsers.toLocaleString(),
            change: stats.users.userGrowth,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            textColor: "text-blue-600"
          },
          {
            title: "Active Jobs",
            value: stats.overview.activeJobs,
            change: 5.2,
            icon: Briefcase,
            color: "from-green-500 to-green-600",
            textColor: "text-green-600"
          },
          {
            title: "Total Revenue",
            value: `$${stats.overview.totalRevenue.toLocaleString()}`,
            change: stats.overview.monthlyGrowth,
            icon: DollarSign,
            color: "from-purple-500 to-purple-600",
            textColor: "text-purple-600"
          },
          {
            title: "KYC Pending",
            value: stats.kyc.pending,
            change: -2.1,
            icon: Shield,
            color: "from-amber-500 to-amber-600",
            textColor: "text-amber-600"
          }
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
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(stat.change)}
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(stat.change)}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
          <div className="h-64">
            <Line 
              data={monthlyGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* KYC Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={kycStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Technicians</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.technicians}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Clients</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recruiters</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.recruiters}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Users (This Month)</span>
              <span className="text-sm font-medium text-green-600">+{stats.users.newUsers}</span>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="text-sm font-medium text-gray-900">{stats.financial.totalTransactions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Volume</span>
              <span className="text-sm font-medium text-gray-900">${stats.financial.totalVolume.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Transaction</span>
              <span className="text-sm font-medium text-gray-900">${stats.financial.averageTransaction}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Volume</span>
              <span className="text-sm font-medium text-green-600">${stats.financial.monthlyVolume.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-green-600">{stats.system.uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">{stats.system.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Load</span>
              <span className="text-sm font-medium text-amber-600">{stats.system.serverLoad}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(stats.system.lastBackup).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Shield className="w-5 h-5" />
            <span>Review KYC</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <Briefcase className="w-5 h-5" />
            <span>View Jobs</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
            <Wrench className="w-5 h-5" />
            <span>System Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminStats;
