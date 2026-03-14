import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import {
  Building, Users, Briefcase, DollarSign, TrendingUp,
  Calendar, FileText, CheckCircle, Clock, AlertCircle,
  Globe, Phone, Mail, MapPin, Star, Award, Target, BarChart3,
  MessageSquare, X, Plus, ArrowRight, Zap, Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../ui/StatCard';
import { EmptyState } from '../ui/EmptyState';
import { DashboardSkeleton } from '../ui/LoadingSkeleton';
import { GradientButton } from '../ui/GradientButton';
import { motion, AnimatePresence } from 'framer-motion';

/* ---- helpers ---- */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
const formatDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const StatusBadge = ({ status }) => {
  const map = {
    Active: 'status-active', active: 'status-active',
    Completed: 'status-complete', Complete: 'status-complete', completed: 'status-complete',
    'In Progress': 'status-active',
    Pending: 'status-pending', pending: 'status-pending',
    'On Hold': 'status-hold',
  };
  return <span className={`status-badge ${map[status] ?? 'status-inactive'}`}>{status}</span>;
};

const ActionItem = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="action-item" type="button">
    <Icon className="action-icon" size={20} strokeWidth={1.8} />
    <span className="action-label">{label}</span>
  </button>
);

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0,0,0.2,1] } },
};

/* ---- modal input ---- */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);
const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200';

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
const CompanyRecruiterDashboard = () => {
  const { user } = useSelector(store => store.auth);
  const navigate  = useNavigate();

  const [companyData,    setCompanyData]    = useState(null);
  const [stats,          setStats]          = useState({ totalJobs:0, activeJobs:0, completedJobs:0, totalRevenue:0, totalExpenses:0, totalTechnicians:0, totalClients:0, pendingApplications:0, activeProjects:0, completedProjects:0, unreadMessages:0 });
  const [recentJobs,     setRecentJobs]     = useState([]);
  const [companyMetrics, setCompanyMetrics] = useState({ employeeCount:0, foundedYear:'', industry:'', annualRevenue:'', clientSatisfaction:0, projectSuccessRate:0 });
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [showEditModal,  setShowEditModal]  = useState(false);

  useEffect(() => {
    if (!user)          { setLoading(false); setError('User data not found.');            return; }
    if (!user.companyId){ setLoading(false); setError('No company associated.');          return; }
    fetchCompanyData();
    fetchDashboardStats();
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const r = await api.get(`/company/${user.companyId}/info`);
      if (r.data.success) {
        const c = r.data.company;
        setCompanyData(c);
        setCompanyMetrics({ employeeCount: c.employeeCount||0, foundedYear: c.foundedYear||'', industry: c.industry||'', annualRevenue: c.annualRevenue||'', clientSatisfaction: c.stats?.clientSatisfaction||0, projectSuccessRate: c.stats?.projectSuccessRate||0 });
      }
    } catch {
      setCompanyData({ name:'Company Name', industry:'Industry' });
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const r = await api.get(`/dashboard/company/${user.companyId}/stats`);
      if (r.data.success) {
        setStats(r.data.stats || {});
        setRecentJobs(r.data.recentJobs || []);
      }
    } catch { /* silently handled */ }
    finally { setLoading(false); }
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="flex items-center justify-center h-80">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <p className="font-semibold text-foreground">{error}</p>
        <GradientButton variant="gradient" size="sm" onClick={() => { setError(null); setLoading(true); fetchCompanyData(); fetchDashboardStats(); }}>
          Retry
        </GradientButton>
      </div>
    </div>
  );

  const statCards = [
    { title: 'Total Jobs',           value: stats.totalJobs,          icon: Briefcase,    gradient: 'from-blue-500 to-indigo-600',   subtitle: 'All time' },
    { title: 'Active Jobs',          value: stats.activeJobs,         icon: Clock,        gradient: 'from-emerald-500 to-teal-600',  subtitle: 'Currently open' },
    { title: 'Total Revenue',        value: `$${stats.totalRevenue?.toLocaleString()||'0'}`, icon: DollarSign, gradient: 'from-violet-500 to-purple-600', subtitle: 'This year' },
    { title: 'Pending Applications', value: stats.pendingApplications,icon: AlertCircle,  gradient: 'from-orange-500 to-rose-500',   subtitle: 'Require review' },
    { title: 'Unread Messages',      value: stats.unreadMessages||0,  icon: MessageSquare,gradient: 'from-cyan-500 to-blue-600',     subtitle: 'Require attention' },
    { title: 'Total Technicians',    value: stats.totalTechnicians,   icon: Users,        gradient: 'from-pink-500 to-rose-600',     subtitle: 'Working with us' },
    { title: 'Active Projects',      value: stats.activeProjects,     icon: Target,       gradient: 'from-indigo-500 to-blue-600',   subtitle: 'In progress' },
    { title: 'Client Satisfaction',  value: `${companyMetrics.clientSatisfaction}/5`, icon: Star, gradient: 'from-amber-400 to-orange-500', subtitle: 'Avg. rating' },
  ];

  const address = companyData?.address;
  const adrStr  = address
    ? [address.street, [address.city, address.state, address.postalCode].filter(Boolean).join(', '), address.country].filter(Boolean).join(' · ')
    : null;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ---- Header ---- */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity:0, y:-10 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3 }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-1">
              <Zap size={11} /> {formatDate()}
            </span>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()},{' '}
              <span className="gradient-text">{user?.fullname?.split(' ')[0] ?? 'Recruiter'}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {companyData?.name ?? 'Your company'} dashboard
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

        {/* ---- Company Banner ---- */}
        <motion.div
          className="card-feature p-6"
          initial={{ opacity:0, y:10 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.35, delay:0.05 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Logo / icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
              {companyData?.logo
                ? <img src={companyData.logo} alt="logo" className="w-full h-full object-cover" />
                : <Building className="h-7 w-7 text-white" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{companyData?.name ?? 'Company Name'}</h2>
                  <p className="text-sm text-muted-foreground">{companyData?.industry ?? 'Industry'}</p>
                </div>
                <GradientButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  leftIcon={<Pencil size={13} />}
                >
                  Edit Profile
                </GradientButton>
              </div>

              {/* Info strip */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                {companyData?.foundedYear && (
                  <span className="flex items-center gap-1"><Calendar size={11} /> Founded {companyData.foundedYear}</span>
                )}
                {(companyData?.employeeCount || companyMetrics.employeeCount > 0) && (
                  <span className="flex items-center gap-1"><Users size={11} /> {companyData?.employeeCount ?? companyMetrics.employeeCount} employees</span>
                )}
                {companyData?.website && (
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe size={11} /> {companyData.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {companyData?.contact?.email && (
                  <span className="flex items-center gap-1"><Mail size={11} /> {companyData.contact.email}</span>
                )}
                {companyData?.contact?.phone && (
                  <span className="flex items-center gap-1"><Phone size={11} /> {companyData.contact.phone}</span>
                )}
                {adrStr && (
                  <span className="flex items-center gap-1"><MapPin size={11} /> {adrStr}</span>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="flex gap-8 flex-shrink-0 sm:border-l sm:border-border sm:pl-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-bold text-foreground tabular-nums">{companyMetrics.clientSatisfaction}/5</span>
                </div>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums mb-0.5">{companyMetrics.projectSuccessRate}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums mb-0.5">{stats.activeProjects ?? 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>

          {/* Your position bar */}
          <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Your role · </span>
              <span className="text-xs font-semibold text-foreground">{user?.fullname}</span>
              <span className="text-xs text-muted-foreground ml-1">· {companyData?.recruiters?.[0]?.position ?? user?.role ?? 'Recruiter'}</span>
            </div>
          </div>
        </motion.div>

        {/* ---- Stat Grid ---- */}
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
          <motion.div className="card-elevated p-5 lg:col-span-2" variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <ActionItem icon={Briefcase} label="Post a Job"   onClick={() => navigate('/app/recruiter/post-job')} />
              <ActionItem icon={Users}     label="Find Talent"  onClick={() => navigate('/app/recruiter/technicians')} />
              <ActionItem icon={FileText}  label="Projects"     onClick={() => navigate('/app/recruiter/projects')} />
              <ActionItem icon={BarChart3} label="Analytics"    onClick={() => navigate('/app/recruiter/analytics')} />
            </div>
          </motion.div>

          <motion.div className="card-elevated p-5 lg:col-span-3" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Recent Jobs</p>
              <button onClick={() => navigate('/app/recruiter/post-job')} className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 font-medium transition-colors">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-1">
              {recentJobs.length > 0 ? recentJobs.map((job) => (
                <div key={job._id ?? job.id} className="activity-row">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      {job.totalSalary && <span className="flex items-center gap-1"><DollarSign size={10}/> ${job.totalSalary?.toLocaleString()}</span>}
                      {job.startTime   && <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(job.startTime).toLocaleDateString()}</span>}
                      {job.endTime     && <span className="flex items-center gap-1"><Clock size={10}/> Due {new Date(job.endTime).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              )) : (
                <EmptyState
                  icon={FileText}
                  title="No jobs posted yet"
                  description="Post your first job to start finding great technicians."
                  action={
                    <GradientButton variant="gradient" size="sm" onClick={() => navigate('/app/recruiter/post-job')} leftIcon={<Plus size={13}/>}>
                      Post a Job
                    </GradientButton>
                  }
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* ---- Company Team ---- */}
        {companyData?.recruiters?.length > 0 && (
          <motion.div className="card-elevated p-5" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Company Team</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companyData.recruiters.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.name ?? 'Recruiter'}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.position ?? 'Position'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* ---- Edit Modal ---- */}
      <AnimatePresence>
        {showEditModal && (
          <CompanyProfileEditModal
            companyData={companyData}
            user={user}
            onClose={() => setShowEditModal(false)}
            onSaved={fetchCompanyData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================================================
   EDIT MODAL (extracted for clarity)
   ================================================================ */
const CompanyProfileEditModal = ({ companyData, user, onClose, onSaved }) => {
  const [editData, setEditData] = useState({
    name:          companyData?.name ?? '',
    industry:      companyData?.industry ?? '',
    description:   companyData?.description ?? '',
    foundedYear:   companyData?.foundedYear ?? '',
    employeeCount: companyData?.employeeCount ?? '',
    annualRevenue: companyData?.annualRevenue ?? '',
    website:       companyData?.website ?? '',
    address: {
      street:     companyData?.address?.street ?? '',
      city:       companyData?.address?.city ?? '',
      state:      companyData?.address?.state ?? '',
      postalCode: companyData?.address?.postalCode ?? '',
      country:    companyData?.address?.country ?? '',
    },
  });
  const [updating, setUpdating] = useState(false);

  const set = (field, val) => {
    if (field.includes('.')) {
      const [p, c] = field.split('.');
      setEditData(prev => ({ ...prev, [p]: { ...prev[p], [c]: val } }));
    } else {
      setEditData(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const r = await api.put(`/company/${user.companyId}/update`, editData);
      if (r.data.success) { await onSaved(); onClose(); }
    } catch { /* silently handled */ }
    finally { setUpdating(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden"
        initial={{ scale:0.96, y:12 }}
        animate={{ scale:1, y:0 }}
        exit={{ scale:0.96, y:12 }}
        transition={{ duration:0.2, ease:[0,0,0.2,1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Edit Company Profile</h2>
            <p className="text-xs text-muted-foreground">Update your company information</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name">
              <input type="text" value={editData.name} onChange={e => set('name', e.target.value)} className={inputCls} required />
            </Field>
            <Field label="Industry">
              <input type="text" value={editData.industry} onChange={e => set('industry', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={editData.description} onChange={e => set('description', e.target.value)} rows={3} className={inputCls} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Founded Year">
              <input type="text" value={editData.foundedYear} onChange={e => set('foundedYear', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Employee Count">
              <input type="text" value={editData.employeeCount} onChange={e => set('employeeCount', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Annual Revenue">
              <input type="text" value={editData.annualRevenue} onChange={e => set('annualRevenue', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Website">
            <input type="url" value={editData.website} onChange={e => set('website', e.target.value)} className={inputCls} placeholder="https://" />
          </Field>

          <div className="pt-1">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Street"><input type="text" value={editData.address.street} onChange={e => set('address.street', e.target.value)} className={inputCls} /></Field>
              <Field label="City">  <input type="text" value={editData.address.city}   onChange={e => set('address.city',   e.target.value)} className={inputCls} /></Field>
              <Field label="State"> <input type="text" value={editData.address.state}  onChange={e => set('address.state',  e.target.value)} className={inputCls} /></Field>
              <Field label="Postal Code"><input type="text" value={editData.address.postalCode} onChange={e => set('address.postalCode', e.target.value)} className={inputCls} /></Field>
              <Field label="Country"><input type="text" value={editData.address.country} onChange={e => set('address.country', e.target.value)} className={inputCls} /></Field>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <GradientButton variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </GradientButton>
          <GradientButton variant="gradient" size="sm" type="submit" loading={updating} onClick={handleSubmit}>
            {updating ? 'Saving…' : 'Save Changes'}
          </GradientButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompanyRecruiterDashboard;