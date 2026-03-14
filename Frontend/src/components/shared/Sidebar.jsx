import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Calendar, Wallet, MessageCircle,
  Users, Building2, FileText, Briefcase,
  X, Menu, Sparkles, ChevronRight
} from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/* ---- item definition arrays ---- */
const buildNavItems = (user) => {
  const role = user?.role?.toLowerCase().trim();

  if (role === 'company' || role === 'recruiter') {
    const base = [
      { path: user?.recruiterType === 'Individual' || !user?.companyId
          ? '/app/recruiter/dashboard-individual'
          : '/app/recruiter/dashboard',
        label: 'Dashboard', icon: Home },
      { path: '/app/recruiter/chat',      label: 'Chat',            icon: MessageCircle },
      { path: '/app/recruiter/wallets',   label: 'Wallets',         icon: Wallet },
      ...(user?.companyId ? [{ path: '/app/recruiter/team-management', label: 'Team Management', icon: Users }] : []),
      { path: '/app/recruiter/profile',   label: 'Profile',         icon: User },
      { path: '/app/recruiter/job-calendar', label: 'Calendar',     icon: Calendar },
    ];
    return base;
  }

  if (role === 'technician') {
    return [
      { path: '/app/technician/calendar',    label: 'Calendar',    icon: Calendar },
      { path: '/app/technician/chat',        label: 'Chat',        icon: MessageCircle },
      { path: '/app/technician/leaderboard', label: 'Leaderboard', icon: Sparkles },
      { path: '/app/technician/wallets',     label: 'Wallets',     icon: Wallet },
      { path: '/app/technician/profile',     label: 'Profile',     icon: User },
    ];
  }

  return [];
};

/* ---- sidebar content (shared between desktop and mobile) ---- */
const SidebarContent = ({ items, location, onClose, user, t, normalizedRole }) => {
  const initials = user?.fullname
    ? user.fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/20">
              <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.fullname ?? t('user')}</p>
              <p className="text-xs text-muted-foreground capitalize">{normalizedRole}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {items.map((item, i) => {
          const Icon    = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Link
                to={item.path}
                onClick={onClose}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={17} strokeWidth={isActive ? 2 : 1.8} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={13} className="ml-auto text-primary/60" />}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {normalizedRole === 'technician' ? t('trackTechnicianJourney') : t('manageRecruitmentWorkflow')}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN SIDEBAR
   ================================================================ */
const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useSelector(store => store.auth);
  const { t }    = useTranslation();

  const normalizedRole = user?.role?.toLowerCase().trim();
  const shouldShow = user && ['recruiter', 'company', 'technician'].includes(normalizedRole);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (!shouldShow) return null;

  const items = buildNavItems(user);

  return (
    <>
      {/* ---- DESKTOP — persistent narrow sidebar ---- */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-border bg-card min-h-[calc(100vh-56px)] sticky top-14 self-start overflow-y-auto scrollbar-thin">
        <SidebarContent
          items={items}
          location={location}
          onClose={null}
          user={user}
          t={t}
          normalizedRole={normalizedRole}
        />
      </aside>

      {/* ---- MOBILE — floating toggle button ---- */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 p-2.5 bg-card border border-border border-l-0 rounded-r-xl shadow-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* ---- MOBILE — backdrop ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <SidebarContent
                items={items}
                location={location}
                onClose={() => setMobileOpen(false)}
                user={user}
                t={t}
                normalizedRole={normalizedRole}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;