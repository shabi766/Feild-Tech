import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
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
  Trash2
} from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

const EnhancedSettings = () => {
  const { user } = useUser();
  const { 
    darkMode, 
    setDarkMode, 
    currency, 
    setCurrency, 
    language, 
    setLanguage,
    timezone,
    setTimezone,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    weekStart,
    setWeekStart
  } = useTheme();

  const [settings, setSettings] = useState({
    // Profile
    fullname: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    
    // Appearance
    darkMode: false,
    
    // Regional
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'monday',
    
    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    showLastSeen: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    jobAlerts: true,
    messageAlerts: true,
    projectUpdates: true,
    paymentNotifications: true,
    
    // Security
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
    currentPassword: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Load user settings on component mount
  useEffect(() => {
    if (user?._id) {
      loadUserSettings();
    }
  }, [user]);

  // Sync local state with theme context
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode,
      language,
      currency,
      timezone,
      dateFormat,
      timeFormat,
      weekStart
    }));
  }, [darkMode, language, currency, timezone, dateFormat, timeFormat, weekStart]);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/users/settings/${user._id}`);
      
      if (response.data.success) {
        const userSettings = response.data.settings;
        setSettings(prev => ({
          ...prev,
          fullname: userSettings.profile.fullname || '',
          email: userSettings.profile.email || '',
          phone: userSettings.profile.phoneNumber || '',
          bio: userSettings.profile.bio || '',
          location: userSettings.profile.location || '',
          website: userSettings.profile.website || '',
          darkMode: userSettings.appearance.darkMode || false,
          language: userSettings.settings.language || 'en',
          currency: userSettings.settings.currency || 'USD',
          timezone: userSettings.settings.timezone || 'UTC',
          dateFormat: userSettings.settings.dateFormat || 'MM/DD/YYYY',
          timeFormat: userSettings.settings.timeFormat || '12h',
          weekStart: userSettings.settings.weekStart || 'monday',
          profileVisibility: userSettings.privacy.profileVisibility || 'public',
          showEmail: userSettings.privacy.showEmail || false,
          showPhone: userSettings.privacy.showPhone || false,
          allowMessages: userSettings.privacy.allowMessages || true,
          showOnlineStatus: userSettings.privacy.showOnlineStatus || true,
          showLastSeen: userSettings.privacy.showLastSeen || true,
          emailNotifications: userSettings.notifications.emailNotifications || true,
          pushNotifications: userSettings.notifications.pushNotifications || true,
          smsNotifications: userSettings.notifications.smsNotifications || false,
          marketingEmails: userSettings.notifications.marketingEmails || false,
          jobAlerts: userSettings.notifications.jobAlerts || true,
          messageAlerts: userSettings.notifications.messageAlerts || true,
          projectUpdates: userSettings.notifications.projectUpdates || true,
          paymentNotifications: userSettings.notifications.paymentNotifications || true
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (section) => {
    try {
      setIsSaving(true);
      
      let updateData = {};
      
      switch (section) {
        case 'profile':
          updateData = {
            fullname: settings.fullname,
            email: settings.email,
            phone: settings.phone,
            bio: settings.bio,
            location: settings.location,
            website: settings.website
          };
          break;
          
        case 'appearance':
          updateData = { darkMode: settings.darkMode };
          break;
          
        case 'regional':
          updateData = {
            language: settings.language,
            currency: settings.currency,
            timezone: settings.timezone,
            dateFormat: settings.dateFormat,
            timeFormat: settings.timeFormat,
            weekStart: settings.weekStart
          };
          break;
          
        case 'privacy':
          updateData = {
            profileVisibility: settings.profileVisibility,
            showEmail: settings.showEmail,
            showPhone: settings.showPhone,
            allowMessages: settings.allowMessages,
            showOnlineStatus: settings.showOnlineStatus,
            showLastSeen: settings.showLastSeen
          };
          break;
          
        case 'notifications':
          updateData = {
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            smsNotifications: settings.smsNotifications,
            marketingEmails: settings.marketingEmails,
            jobAlerts: settings.jobAlerts,
            messageAlerts: settings.messageAlerts,
            projectUpdates: settings.projectUpdates,
            paymentNotifications: settings.paymentNotifications
          };
          break;
          
        case 'security':
          if (settings.password && settings.password !== settings.confirmPassword) {
            toast.error('Passwords do not match');
            return;
          }
          if (settings.password && settings.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
          }
          updateData = { password: settings.password };
          break;
      }

      const response = await axios.put(`/api/users/update/${user._id}`, updateData);
      
      if (response.data.success) {
        // Update theme context for immediate effect
        if (section === 'appearance') {
          setDarkMode(settings.darkMode);
        }
        if (section === 'regional') {
          setLanguage(settings.language);
          setCurrency(settings.currency);
          setTimezone(settings.timezone);
          setDateFormat(settings.dateFormat);
          setTimeFormat(settings.timeFormat);
          setWeekStart(settings.weekStart);
        }
        
        toast.success('Settings updated successfully!');
        
        // Clear password fields after successful update
        if (section === 'security') {
          setSettings(prev => ({
            ...prev,
            password: '',
            confirmPassword: '',
            currentPassword: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/delete-account/${user._id}`);
        toast.success('Account deleted successfully');
        // Redirect to logout or home page
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'regional', label: 'Regional', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  value={settings.fullname}
                  onChange={(e) => handleChange('fullname', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <Button 
              onClick={() => handleSubmit('profile')} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance & Theme
            </CardTitle>
            <CardDescription>
              Customize how the platform looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleChange('darkMode', checked)}
              />
            </div>
            
            <Button 
              onClick={() => handleSubmit('appearance')} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Appearance
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Regional Settings */}
      {activeTab === 'regional' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Regional & Language Settings
            </CardTitle>
            <CardDescription>
              Set your preferred language, currency, and regional formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => handleChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select value={settings.timeFormat} onValueChange={(value) => handleChange('timeFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="weekStart">Week Start</Label>
                <Select value={settings.weekStart} onValueChange={(value) => handleChange('weekStart', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={() => handleSubmit('regional')} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Regional Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings */}
      {activeTab === 'privacy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Visibility
            </CardTitle>
            <CardDescription>
              Control who can see your information and profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select value={settings.profileVisibility} onValueChange={(value) => handleChange('profileVisibility', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can view</SelectItem>
                  <SelectItem value="registered">Registered Users Only</SelectItem>
                  <SelectItem value="private">Private - Only you can view</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your email</p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleChange('showEmail', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Show Phone Number</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => handleChange('showPhone', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">Let others send you messages</p>
                </div>
                <Switch
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) => handleChange('allowMessages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">Display when you're online</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => handleChange('showOnlineStatus', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Show Last Seen</Label>
                  <p className="text-sm text-muted-foreground">Display when you were last active</p>
                </div>
                <Switch
                  checked={settings.showLastSeen}
                  onCheckedChange={(checked) => handleChange('showLastSeen', checked)}
                />
              </div>
            </div>
            
            <Button 
              onClick={() => handleSubmit('privacy')} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how and when you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleChange('smsNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional and marketing content</p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleChange('marketingEmails', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Job Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new job opportunities</p>
                </div>
                <Switch
                  checked={settings.jobAlerts}
                  onCheckedChange={(checked) => handleChange('jobAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Message Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                </div>
                <Switch
                  checked={settings.messageAlerts}
                  onCheckedChange={(checked) => handleChange('messageAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Project Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                </div>
                <Switch
                  checked={settings.projectUpdates}
                  onCheckedChange={(checked) => handleChange('projectUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payment activities</p>
                </div>
                <Switch
                  checked={settings.paymentNotifications}
                  onCheckedChange={(checked) => handleChange('paymentNotifications', checked)}
                />
              </div>
            </div>
            
            <Button 
              onClick={() => handleSubmit('notifications')} 
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.currentPassword ? "text" : "password"}
                    value={settings.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.currentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.password ? "text" : "password"}
                    value={settings.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.password ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    value={settings.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSubmit('security')} 
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedSettings;
