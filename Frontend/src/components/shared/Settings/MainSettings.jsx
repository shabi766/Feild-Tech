import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  User,
  Lock,
  Smartphone,
  Mail,
  Monitor,
  Clock,
  Calendar,
  DollarSign,
  Languages,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableLanguages, getAvailableCurrencies, getAvailableTimezones } from '@/utils/i18n';
import { useTranslation } from '@/Hooks/useTranslation';

// Import individual settings components
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import PreferencesSettings from './PreferencesSettings';
import PrivacySettings from './PrivacySettings';
import NotificationsSettings from './NotificationsSettings';
import AdditionalSettings from './AdditionalSettings';

const MainSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const settingsContext = useSettings();
  const { t, currentLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  // Destructure with fallbacks to prevent errors
  const { 
    settings = {}, 
    updateSetting = () => {}, 
    updateMultipleSettings = () => {}, 
    resetToDefaults = () => {}, 
    isLoading = false 
  } = settingsContext || {};

  // Show loading if context is not yet available
  if (!settingsContext) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingSettings', currentLanguage)}</p>
        </div>
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateSetting(name, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Handle form submission logic here
              setSaveStatus({ type: 'success', message: t('settingsUpdated', currentLanguage) });
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        setSaveStatus({ type: 'error', message: t('settingsUpdateFailed', currentLanguage) });
        setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible!')) {
      try {
        // Handle account deletion logic here
        toast.success('Account deleted successfully!');
      } catch (error) {
        toast.error('Error deleting account.');
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddCertification = () => {
    const newCertifications = [...(settings.certifications || []), ''];
    updateSetting('certifications', newCertifications);
  };

  const handleRemoveCertification = (index) => {
    const newCertifications = (settings.certifications || []).filter((_, i) => i !== index);
    updateSetting('certifications', newCertifications);
  };

  const handleCertificationChange = (e, index) => {
    const newCertifications = [...(settings.certifications || [])];
    newCertifications[index] = e.target.value;
    updateSetting('certifications', newCertifications);
  };

  const handleAddCourse = () => {
    const newCourses = [...(settings.courses || []), ''];
    updateSetting('courses', newCourses);
  };

  const handleRemoveCourse = (index) => {
    const newCourses = (settings.courses || []).filter((_, i) => i !== index);
    updateSetting('courses', newCourses);
  };

  const handleCourseChange = (e, index) => {
    const newCourses = [...(settings.courses || [])];
    newCourses[index] = e.target.value;
    updateSetting('courses', newCourses);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('accountSettings', currentLanguage)}
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('accountSettingsDesc', currentLanguage)}
        </p>
      </div>

      {/* Status Messages */}
      {saveStatus && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-lg ${
          saveStatus.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
        }`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
          <span className="font-medium text-lg">{saveStatus.message}</span>
        </div>
      )}

      {/* User Profile Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={user?.profile?.profilePhoto || '/default-avatar.png'} alt="Profile" />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(user?.fullname || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.fullname}</h2>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {user?.role}
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  {t ? t(settings.language, settings.language) : settings.language}
                </Badge>
                <Badge variant="outline" className="border-gray-300">
                  {settings.currency}
                </Badge>
                {settings.darkMode && (
                  <Badge variant="outline" className="border-gray-300">
                    <Moon className="w-3 h-3 mr-1" />
                    Dark Mode
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResetSettings}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              >
                <RotateCcw className="w-4 h-4" />
                {t('resetAll', currentLanguage)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-16 bg-gray-50 p-1 rounded-xl">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('profile', currentLanguage)}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="account" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('account', currentLanguage)}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Palette className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('preferences', currentLanguage)}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="privacy" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Lock className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('privacy', currentLanguage)}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('notifications', currentLanguage)}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="additional" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('more', currentLanguage)}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings 
            user={user}
            settings={settings}
            updateSetting={updateSetting}
            isLoading={isLoading}
            setSaveStatus={setSaveStatus}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <AccountSettings 
            user={user}
            settings={settings}
            showPasswords={showPasswords}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleDeleteAccount={handleDeleteAccount}
            togglePasswordVisibility={togglePasswordVisibility}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSettings 
            settings={settings}
            updateSetting={updateSetting}
            isLoading={isLoading}
            setSaveStatus={setSaveStatus}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings 
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleChange}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSettings 
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleChange}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Additional Tab */}
        <TabsContent value="additional" className="space-y-6">
          <AdditionalSettings 
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleChange}
            handleAddCertification={handleAddCertification}
            handleRemoveCertification={handleRemoveCertification}
            handleCertificationChange={handleCertificationChange}
            handleAddCourse={handleAddCourse}
            handleRemoveCourse={handleRemoveCourse}
            handleCourseChange={handleCourseChange}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="text-gray-600 font-medium">{t('updatingSettings', currentLanguage)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSettings;
