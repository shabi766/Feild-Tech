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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showToggle, setShowToggle] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const location = useLocation();
  const { user } = useSelector(store => store.auth);

  // Only show sidebar for Recruiter and Technician roles
  if (!user || (user.role !== 'Recruiter' && user.role !== 'Technician')) {
    return null;
  }

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

    switch (user.role) {
      case 'Recruiter':
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
            path: '/app/recruiter/profile', 
            label: 'Profile', 
            icon: User,
            color: 'from-purple-500 to-purple-600',
            description: 'Your account settings'
          },
          { 
            path: '/app/recruiter/jobcalender', 
            label: 'Calendar', 
            icon: Calendar,
            color: 'from-red-500 to-red-600',
            description: 'Schedule management'
          }
        ];
      
      case 'Technician':
        return [
          { 
            path: '/app/technician/calender', 
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
            color: 'from-purple-500 to-purple-600',
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
              className="group relative p-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-r-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500"
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
                {isOpen ? 'Close Menu' : 'Open Menu'}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-white/90 rotate-45"></div>
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-r-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
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
              className="relative px-4 py-3 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-r-2xl shadow-xl border border-white/20"
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
                <span>Scroll or hover to reveal menu</span>
              </div>
              
              {/* Arrow pointing left */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gradient-to-r from-blue-500/90 to-purple-500/90 rotate-45"></div>
              
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
            className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white z-50 shadow-2xl"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <motion.h2 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {user?.role === 'Recruiter' ? 'Recruiter Hub' : 'Technician Hub'}
                </motion.h2>
                <motion.button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <motion.div 
                className="text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Welcome back, {user?.name || 'User'}
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
                        className={`group relative block p-4 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                            : 'hover:bg-gray-800/50 border border-transparent hover:border-gray-600/30'
                        }`}
                        onClick={closeSidebar}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            className={`p-3 rounded-lg bg-gradient-to-r ${item.color} shadow-lg`}
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <IconComponent size={20} className="text-white" />
                          </motion.div>
                          
                          <div className="flex-1">
                            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {item.label}
                            </div>
                            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                              {item.description}
                            </div>
                          </div>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                        )}

                        {/* Hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">
                  {user?.role === 'Recruiter' ? 'Manage your recruitment workflow' : 'Track your technician journey'}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
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