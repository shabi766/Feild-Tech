import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';
import { toast } from 'sonner';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'monday',
    notifications: true,
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      showOnlineStatus: true,
      showLastSeen: true
    },
    notificationPreferences: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      jobAlerts: true,
      messageAlerts: true,
      projectUpdates: true,
      paymentNotifications: true
    },
            certifications: [],
        courses: [],
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: ''
        }
      });

  const [isLoading, setIsLoading] = useState(false);

  // Load user settings on mount
  useEffect(() => {
    if (user) {
      // Check localStorage first for language preference
      const storedLanguage = localStorage.getItem('appLanguage');
      
      setSettings({
        darkMode: user.darkMode || false,
        language: storedLanguage || user.settings?.language || 'en',
        currency: user.settings?.currency || 'USD',
        timezone: user.settings?.timezone || 'UTC',
        dateFormat: user.settings?.dateFormat || 'MM/DD/YYYY',
        timeFormat: user.settings?.timeFormat || '12h',
        weekStart: user.settings?.weekStart || 'monday',
        notifications: user.notifications !== undefined ? user.notifications : true,
        privacy: {
          profileVisibility: user.privacy?.profileVisibility || 'public',
          showEmail: user.privacy?.showEmail || false,
          showPhone: user.privacy?.showPhone || false,
          allowMessages: user.privacy?.allowMessages !== undefined ? user.privacy.allowMessages : true,
          showOnlineStatus: user.privacy?.showOnlineStatus !== undefined ? user.privacy.showOnlineStatus : true,
          showLastSeen: user.privacy?.showLastSeen !== undefined ? user.privacy.showLastSeen : true
        },
        notificationPreferences: {
          emailNotifications: user.notificationPreferences?.emailNotifications !== undefined ? user.notificationPreferences.emailNotifications : true,
          pushNotifications: user.notificationPreferences?.pushNotifications !== undefined ? user.notificationPreferences.pushNotifications : true,
          smsNotifications: user.notificationPreferences?.smsNotifications || false,
          marketingEmails: user.notificationPreferences?.marketingEmails || false,
          jobAlerts: user.notificationPreferences?.jobAlerts !== undefined ? user.notificationPreferences.jobAlerts : true,
          messageAlerts: user.notificationPreferences?.messageAlerts !== undefined ? user.notificationPreferences.messageAlerts : true,
          projectUpdates: user.notificationPreferences?.projectUpdates !== undefined ? user.notificationPreferences.projectUpdates : true,
          paymentNotifications: user.notificationPreferences?.paymentNotifications !== undefined ? user.notificationPreferences.paymentNotifications : true
        },
        certifications: user.certifications || [],
        courses: user.courses || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          twitter: user.socialLinks?.twitter || '',
          github: user.socialLinks?.github || ''
        }
      });
    }
  }, [user]);

  const { setDarkMode } = useTheme();

  // Note: Document dark mode styling is managed entirely by ThemeContext.jsx 
  // to avoid conflicts with local user preferences vs system preferences.
  // We synchronize the settings dark mode with the theme context here.
  useEffect(() => {
    if (user && settings.darkMode !== undefined) {
      setDarkMode(settings.darkMode);
    }
  }, [settings.darkMode, setDarkMode, user]);

  // Handle language persistence and document updates
  useEffect(() => {
    if (settings.language) {
      // Update document language
      document.documentElement.lang = settings.language;
      // Persist to localStorage only if it's different
      const currentStored = localStorage.getItem('appLanguage');
      if (currentStored !== settings.language) {
        localStorage.setItem('appLanguage', settings.language);
      }
    }
  }, [settings.language]);

  const updateSetting = async (key, value) => {
    setIsLoading(true);
    try {
      const updateData = {};
      
      // Handle nested updates - flatten the structure for backend
      if (key.includes('.')) {
        const [category, subKey] = key.split('.');
        // Send the subKey directly instead of nested structure
        updateData[subKey] = value;
      } else {
        updateData[key] = value;
      }

      console.log('Sending update to backend:', { key, value, updateData });

      // Update local state immediately for better UX
      setSettings(prev => {
        if (key.includes('.')) {
          const [category, subKey] = key.split('.');
          return {
            ...prev,
            [category]: { ...prev[category], [subKey]: value }
          };
        }
        return { ...prev, [key]: value };
      });

      // Send update to backend
      const response = await axios.put(`${USER_API_END_POINT}/update/${user._id}`, updateData, {
        withCredentials: true
      });

      console.log('Backend response:', response.data);
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error.response?.data || error.message);
      // Revert local state on error
      setSettings(prev => {
        if (key.includes('.')) {
          const [category, subKey] = key.split('.');
          return {
            ...prev,
            [category]: { ...prev[category], [subKey]: settings[category][subKey] }
          };
        }
        return { ...prev, [key]: settings[key] };
      });
      
      toast.error(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMultipleSettings = async (updates) => {
    setIsLoading(true);
    try {
      // Update local state immediately
      setSettings(prev => ({ ...prev, ...updates }));

      // Flatten nested settings for backend
      const flattenedUpdates = {};
      Object.keys(updates).forEach(key => {
        if (key === 'socialLinks' && typeof updates[key] === 'object' && updates[key] !== null) {
          // Keep socialLinks nested as the backend expects it
          flattenedUpdates[key] = updates[key];
        } else if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
          // Handle nested objects like privacy, notificationPreferences, etc.
          Object.keys(updates[key]).forEach(subKey => {
            flattenedUpdates[subKey] = updates[key][subKey];
          });
        } else {
          // Handle simple values
          flattenedUpdates[key] = updates[key];
        }
      });

      // Send flattened updates to backend
      await axios.put(`${USER_API_END_POINT}/update/${user._id}`, flattenedUpdates, {
        withCredentials: true
      });

      toast.success('Settings updated successfully');
    } catch (error) {
      // Revert local state on error
      setSettings(prev => ({ ...prev, ...settings }));
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = async () => {
    const defaultSettings = {
      darkMode: false,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      weekStart: 'monday',
      notifications: true,
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
        showOnlineStatus: true,
        showLastSeen: true
      },
              notificationPreferences: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          jobAlerts: true,
          messageAlerts: true,
          projectUpdates: true,
          paymentNotifications: true
        },
        certifications: [],
        courses: [],
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: ''
        }
      };

    try {
      await updateMultipleSettings(defaultSettings);
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  const value = {
    settings,
    updateSetting,
    updateMultipleSettings,
    resetToDefaults,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

