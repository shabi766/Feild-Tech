import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Calendar,
  Wallet,
  MessageCircle,
  Plus,
  Users,
  Building2,
  FileText,
  Briefcase,
  ChevronRight,
  X,
  Menu,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showToggle, setShowToggle] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const location = useLocation();
  const { user } = useSelector(store => store.auth);
  const { t } = useTranslation();

  // Check if sidebar should be shown
  const normalizedRole = user?.role?.toLowerCase().trim();
  const shouldShowSidebar = user && (normalizedRole === 'recruiter' || normalizedRole === 'company' || normalizedRole === 'technician');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when navigating
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Automatically close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  // Show toggle button on scroll or after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowToggle(true), 2000);
    const handleScroll = () => setShowToggle(true);

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show hint after a longer delay if toggle is not visible
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      if (!showToggle) {
        setShowHint(true);
      }
    }, 5000);

    return () => clearTimeout(hintTimer);
  }, [showToggle]);

  // Role-specific navigation items (excluding items already in navbars)
  const getNavigationItems = () => {
    if (!user) return [];

    const normalizedRole = user.role?.toLowerCase().trim();
    switch (normalizedRole) {
      case 'company':
        // Company recruiter (backend returns role: "Company")
        return [
          {
            path: '/app/recruiter/dashboard',
            label: 'Dashboard',
            icon: Home,
            color: 'from-blue-500 to-blue-600',
            description: 'Overview & Analytics'
          },
          {
            path: '/app/recruiter/chat',
            label: 'Chat',
            icon: MessageCircle,
            color: 'from-green-500 to-green-600',
            description: 'Communicate with team'
          },
          {
            path: '/app/recruiter/wallets',
            label: 'Wallets',
            icon: Wallet,
            color: 'from-yellow-500 to-yellow-600',
            description: 'Manage payments'
          },
          {
            path: '/app/recruiter/team-management',
            label: 'Team Management',
            icon: Users,
            color: 'from-primary to-primary-dark',
            description: 'Manage company teams & roles'
          },
          {
            path: '/app/recruiter/profile',
            label: 'Profile',
            icon: User,
            color: 'from-primary to-primary-dark',
            description: 'Your account settings'
          },
          {
            path: '/app/recruiter/job-calendar',
            label: 'Calendar',
            icon: Calendar,
            color: 'from-red-500 to-red-600',
            description: 'Schedule management'
          }
        ];
      case 'recruiter':
        return [
          {
            path: user.recruiterType === 'Individual' || !user.companyId ?
              '/app/recruiter/dashboard-individual' : '/app/recruiter/dashboard',
            label: 'Dashboard',
            icon: Home,
            color: 'from-blue-500 to-blue-600',
            description: 'Overview & Analytics'
          },
          {
            path: '/app/recruiter/chat',
            label: 'Chat',
            icon: MessageCircle,
            color: 'from-green-500 to-green-600',
            description: 'Communicate with team'
          },
          {
            path: '/app/recruiter/wallets',
            label: 'Wallets',
            icon: Wallet,
            color: 'from-yellow-500 to-yellow-600',
            description: 'Manage payments'
          },
          // Only show Team Management for company recruiters
          ...(user.companyId ? [{
            path: '/app/recruiter/team-management',
            label: 'Team Management',
            icon: Users,
            color: 'from-primary to-primary-dark',
            description: 'Manage company teams & roles'
          }] : []),
          {
            path: '/app/recruiter/profile',
            label: 'Profile',
            icon: User,
            color: 'from-primary to-primary-dark',
            description: 'Your account settings'
          },
          {
            path: '/app/recruiter/job-calendar',
            label: 'Calendar',
            icon: Calendar,
            color: 'from-red-500 to-red-600',
            description: 'Schedule management'
          }
        ];

      case 'technician':
        return [
          {
            path: '/app/technician/calendar',
            label: 'Calendar',
            icon: Calendar,
            color: 'from-red-500 to-red-600',
            description: 'Job scheduling'
          },
          {
            path: '/app/technician/chat',
            label: 'Chat',
            icon: MessageCircle,
            color: 'from-green-500 to-green-600',
            description: 'Team communication'
          },
          {
            path: '/app/technician/leaderboard',
            label: 'Leaderboard',
            icon: Sparkles,
            color: 'from-orange-500 to-orange-600',
            description: 'View rankings & performance'
          },
          {
            path: '/app/technician/wallets',
            label: 'Wallets',
            icon: Wallet,
            color: 'from-yellow-500 to-yellow-600',
            description: 'Payment management'
          },
          {
            path: '/app/technician/profile',
            label: 'Profile',
            icon: User,
            color: 'from-primary to-primary-dark',
            description: 'Account settings'
          }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  // Sidebar variants for animations
  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  // Don't render sidebar if user doesn't have access
  if (!shouldShowSidebar) {
    return null;
  }

  return (
    <>
      {/* Creative Toggle Button - Hidden by default, appears on scroll/hover */}
      <AnimatePresence>
        {showToggle && (
          <motion.div
            className="fixed top-1/2 left-0 z-50 transform -translate-y-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Main Toggle Button */}
            <motion.button
              onClick={toggleSidebar}
              className="group relative p-3 bg-gradient-to-r from-primary via-primary-dark to-primary-light text-white rounded-r-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-500"
              whileHover={{
                scale: 1.1,
                x: 5,
                boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>

              {/* Floating Label */}
              <motion.div
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                {isOpen ? t('closeMenu') : t('openMenu')}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white/90 rotate-45"></div>
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-dark rounded-r-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-light to-primary rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hint - Shows when toggle is hidden */}
      <AnimatePresence>
        {showHint && !showToggle && !isOpen && (
          <motion.div
            className="fixed top-1/2 left-8 z-40 transform -translate-y-1/2"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="relative px-4 py-3 bg-gradient-to-r from-primary/90 to-primary-dark/90 backdrop-blur-sm text-white text-sm font-medium rounded-r-2xl shadow-xl border border-white/20"
              animate={{
                x: [0, 5, 0],
                boxShadow: [
                  "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                  "0 20px 40px -10px rgba(147, 51, 234, 0.4)",
                  "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="animate-pulse" />
                <span>{t('scrollOrHoverToReveal')}</span>
              </div>

              {/* Arrow pointing left */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gradient-to-r from-primary/90 to-primary-dark/90 rotate-45"></div>

              {/* Auto-hide hint after 3 seconds */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                onAnimationComplete={() => {
                  setTimeout(() => setShowHint(false), 3000);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border text-foreground z-50 shadow-2xl"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between mb-4">
                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {(normalizedRole === 'recruiter' || normalizedRole === 'company') ? t('recruiterHub') : t('technicianHub')}
                </motion.h2>
                <motion.button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <motion.div
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {t('welcomeBack')}, {user?.name || t('user')}
              </motion.div>
            </div>

            {/* Navigation Items */}
            <div className="p-4">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.div
                      key={item.path}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        className={`group relative block p-4 rounded-xl transition-all duration-300 ${isActive
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted border border-transparent'
                          }`}
                        onClick={closeSidebar}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            className={`p-3 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'} shadow-sm transition-colors`}
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <IconComponent size={20} />
                          </motion.div>

                          <div className="flex-1">
                            <div className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'} group-hover:text-primary transition-colors`}>
                              {item.label}
                            </div>
                            <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                              {item.description}
                            </div>
                          </div>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-muted/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="text-muted-foreground text-sm mb-2">
                  {(normalizedRole === 'recruiter' || normalizedRole === 'company') ? t('manageRecruitmentWorkflow') : t('trackTechnicianJourney')}
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <motion.div
                    className="bg-primary h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;