import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings, User, Shield, Palette, Lock, Bell, MoreHorizontal,
  RotateCcw, CheckCircle, AlertCircle, Moon, LogOut
} from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

// Individual components
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import PreferencesSettings from './PreferencesSettings';
import PrivacySettings from './PrivacySettings';
import NotificationsSettings from './NotificationsSettings';
import AdditionalSettings from './AdditionalSettings';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'additional', label: 'More', icon: MoreHorizontal },
];

const MainSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const settingsContext = useSettings();
  const { t, currentLanguage } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });

  // Destructure safely
  const {
    settings = {},
    updateSetting = () => {},
    resetToDefaults = () => {},
    isLoading = false
  } = settingsContext || {};

  if (!settingsContext) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleResetSettings = async () => {
    if (window.confirm(t('resetAllConfirm', currentLanguage))) {
      try {
        await resetToDefaults();
        setSaveStatus({ type: 'success', message: t('settingsReset', currentLanguage) });
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        setSaveStatus({ type: 'error', message: t('settingsResetFailed', currentLanguage) });
        setTimeout(() => setSaveStatus(null), 5000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateSetting(name, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      setSaveStatus({ type: 'success', message: t('settingsUpdated', currentLanguage) });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus({ type: 'error', message: t('settingsUpdateFailed', currentLanguage) });
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // Helper renderers for active tab content
  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileSettings user={user} settings={settings} updateSetting={updateSetting} isLoading={isLoading} setSaveStatus={setSaveStatus} />;
      case 'account':
        return <AccountSettings user={user} settings={settings} showPasswords={showPasswords} handleChange={handleChange} handleSubmit={handleSubmit} handleDeleteAccount={()=>{}} togglePasswordVisibility={(field) => setShowPasswords(prev => ({...prev, [field]: !prev[field]}))} isSaving={isSaving} />;
      case 'preferences':
        return <PreferencesSettings settings={settings} updateSetting={updateSetting} isLoading={isLoading} setSaveStatus={setSaveStatus} />;
      case 'privacy':
        return <PrivacySettings settings={settings} handleSubmit={handleSubmit} handleNestedChange={handleChange} isSaving={isSaving} />;
      case 'notifications':
        return <NotificationsSettings settings={settings} handleSubmit={handleSubmit} handleNestedChange={handleChange} isSaving={isSaving} />;
      case 'additional':
        return <AdditionalSettings settings={settings} handleSubmit={handleSubmit} handleNestedChange={handleChange} isSaving={isSaving} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in w-full">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('accountSettings', currentLanguage) || 'Settings'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>

      {/* Global Status Toast (inline) */}
      {saveStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
            saveStatus.type === 'success' 
              ? 'bg-green-50/50 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300' 
              : 'bg-red-50/50 text-red-800 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300'
          }`}
        >
          {saveStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{saveStatus.message}</span>
        </motion.div>
      )}

      {/* Layout Grid: Sidebar Nav + Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar (Nav & Mini Profile) */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          
          {/* Mini Profile Card */}
          <div className="card-elevated p-5 flex flex-col items-center text-center space-y-3">
            <Avatar className="w-20 h-20 ring-4 ring-background shadow-sm">
              <AvatarImage src={user?.profile?.profilePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {getInitials(user?.fullname)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{user?.fullname}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2 text-[10px] uppercase font-semibold">{user?.role}</Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-thin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Reset Action */}
          <div className="pt-2 border-t border-border hidden lg:block">
            <button
              onClick={handleResetSettings}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors w-full"
            >
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 w-full min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-6"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-foreground text-sm font-medium">{t('updatingSettings', currentLanguage) || 'Saving...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSettings;
