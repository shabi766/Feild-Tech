import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import {
  Users, Briefcase, Building, FileText, TrendingUp,
  Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
  Star, Target, BarChart3, Globe, Award, MessageSquare,
  Plus, ArrowRight, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../ui/StatCard';
import { EmptyState } from '../ui/EmptyState';
import { DashboardSkeleton } from '../ui/LoadingSkeleton';
import { GradientButton } from '../ui/GradientButton';
import { motion } from 'framer-motion';

/* ---- helper to format date ---- */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/* ---- status badge ---- */
const StatusBadge = ({ status }) => {
  const map = {
    Active:      'status-active',
    active:      'status-active',
    Completed:   'status-complete',
    Complete:    'status-complete',
    completed:   'status-complete',
    'In Progress': 'status-active',
    Pending:     'status-pending',
    pending:     'status-pending',
    'On Hold':   'status-hold',
  };
  return (
    <span className={`status-badge ${map[status] ?? 'status-inactive'}`}>
      {status}
    </span>
  );
};

/* ---- quick action item ---- */
const ActionItem = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="action-item" type="button">
    <Icon className="action-icon" size={20} strokeWidth={1.8} />
    <span className="action-label">{label}</span>
  </button>
);

/* ---- stagger container ---- */
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
};

const AdminDashboard = () => {
  const { user } = useSelector(store => store.auth);
  const navigate  = useNavigate();

  const [stats, setStats] = useState({
    totalJobs: 0, activeJobs: 0, completedJobs: 0,
    totalClients: 0, totalTechnicians: 0, totalProjects: 0,
    revenue: 0, pendingApplications: 0, activeProjects: 0,
    totalRevenue: 0, averageRating: 0, projectSuccessRate: 0,
    unreadMessages: 0,
  });
  const [recentJobs,     setRecentJobs]     = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    if (user?.companyId) fetchDashboardStats();
    else setLoading(false);
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get(`/dashboard/company/${user.companyId}/stats`);
      if (res.data.success) {
        setStats(res.data.stats || {});
        setRecentJobs(res.data.recentJobs || []);
        setRecentProjects(res.data.recentProjects || []);
      }
    } catch (e) {
      console.error('Dashboard stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { title: 'Total Jobs',            value: stats.totalJobs,          icon: Briefcase,    gradient: 'from-blue-500 to-indigo-600',   subtitle: 'All time' },
    { title: 'Active Jobs',            value: stats.activeJobs,         icon: Clock,        gradient: 'from-emerald-500 to-teal-600',  subtitle: 'Currently open' },
    { title: 'Total Revenue',          value: `$${stats.totalRevenue?.toLocaleString() ?? '0'}`, icon: DollarSign, gradient: 'from-violet-500 to-purple-600', subtitle: 'This year' },
    { title: 'Pending Applications',   value: stats.pendingApplications,icon: AlertCircle,  gradient: 'from-orange-500 to-rose-500',   subtitle: 'Require review' },
    { title: 'Unread Messages',        value: stats.unreadMessages || 0,icon: MessageSquare,gradient: 'from-cyan-500 to-blue-600',     subtitle: 'Require attention' },
    { title: 'Total Technicians',      value: stats.totalTechnicians,   icon: Users,        gradient: 'from-pink-500 to-rose-600',     subtitle: 'Working with us' },
    { title: 'Total Projects',         value: stats.totalProjects,      icon: FileText,     gradient: 'from-indigo-500 to-blue-600',   subtitle: 'All time' },
    { title: 'Total Clients',          value: stats.totalClients,       icon: Building,     gradient: 'from-teal-500 to-cyan-600',     subtitle: 'Served' },
  ];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ---- Header ---- */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Zap size={11} />
                {formatDate()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()},{' '}
              <span className="gradient-text">{user?.fullname?.split(' ')[0] ?? 'Admin'}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's your company overview for today
            </p>
          </div>
          <GradientButton
            variant="gradient"
            onClick={() => navigate('/app/recruiter/post-job')}
            leftIcon={<Plus size={15} />}
          >
            Post a Job
          </GradientButton>
        </motion.div>

        {/* ---- Company Overview Banner ---- */}
        <motion.div
          className="card-feature p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md flex-shrink-0">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Company Overview</h2>
                <p className="text-sm text-muted-foreground">Performance metrics &amp; key indicators</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {stats.averageRating?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Avg. Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums mb-0.5">
                  {stats.projectSuccessRate ?? 0}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums mb-0.5">
                  {stats.activeProjects ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Projects</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums mb-0.5">
                  {stats.completedJobs ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Jobs Done</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- Stats Grid ---- */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((card, i) => (
            <StatCard key={card.title} delay={i * 55} {...card} />
          ))}
        </motion.div>

        {/* ---- Quick Actions + Recent Jobs ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Quick Actions */}
          <motion.div
            className="card-elevated p-5 lg:col-span-2"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ActionItem icon={Briefcase}  label="Post a Job"       onClick={() => navigate('/app/recruiter/post-job')} />
              <ActionItem icon={Users}      label="Find Talent"      onClick={() => navigate('/app/recruiter/technicians')} />
              <ActionItem icon={FileText}   label="Projects"         onClick={() => navigate('/app/recruiter/projects')} />
              <ActionItem icon={BarChart3}  label="Analytics"        onClick={() => navigate('/app/recruiter/analytics')} />
            </div>
          </motion.div>

          {/* Recent Job Postings */}
          <motion.div
            className="card-elevated p-5 lg:col-span-3"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Recent Job Postings
              </p>
              <button
                onClick={() => navigate('/app/recruiter/post-job')}
                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 font-medium transition-colors"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-1">
              {recentJobs.length > 0 ? recentJobs.map((job) => (
                <div key={job.id ?? job._id} className="activity-row">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {job.deadline}
                        </span>
                      )}
                      {job.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} /> ${job.budget}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {job.applicants ?? 0} applicants
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              )) : (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs posted yet"
                  description="Start by posting your first job to find great talent."
                  action={
                    <GradientButton
                      variant="gradient"
                      size="sm"
                      onClick={() => navigate('/app/recruiter/post-job')}
                      leftIcon={<Plus size={13} />}
                    >
                      Post Your First Job
                    </GradientButton>
                  }
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* ---- Recent Projects ---- */}
        <motion.div
          className="card-elevated p-5"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Recent Projects
            </p>
          </div>

          <div className="space-y-1">
            {recentProjects.length > 0 ? recentProjects.map((project) => (
              <div key={project.id ?? project._id} className="activity-row">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {project.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {project.startDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Target size={10} /> {project.progress ?? 0}% complete
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {project.teamSize ?? 0} members
                    </span>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>
            )) : (
              <EmptyState
                icon={FileText}
                title="No projects yet"
                description="Projects will appear here once you start managing them."
              />
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
