import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings, deleteAccount } from "@/redux/userSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Lock, 
  CreditCard, 
  FileText, 
  MapPin, 
  Award,
  BookOpen,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { USER_API_END_POINT } from "@/components/utils/constant";

// Import and re-export MainSettings
import MainSettings from "./Settings/MainSettings";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [settings, setSettings] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    notifications: user?.notifications || false,
    darkMode: user?.darkMode || false,
    language: user?.language || "en",
    timezone: user?.timezone || "UTC",
    profilePhoto: null,
    certifications: user?.certifications || [],
    courses: user?.courses || [],
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
    website: user?.website || "",
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || "",
      twitter: user?.socialLinks?.twitter || "",
      github: user?.socialLinks?.github || ""
    },
    privacy: {
      profileVisibility: user?.privacy?.profileVisibility || "public",
      showEmail: user?.privacy?.showEmail || false,
      showPhone: user?.privacy?.showPhone || false,
      allowMessages: user?.privacy?.allowMessages || true
    },
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications || true,
      pushNotifications: user?.preferences?.pushNotifications || true,
      smsNotifications: user?.preferences?.smsNotifications || false,
      marketingEmails: user?.preferences?.marketingEmails || false,
      jobAlerts: user?.preferences?.jobAlerts || true,
      messageAlerts: user?.preferences?.messageAlerts || true
    }
  });

  const [previewImage, setPreviewImage] = useState(
    user?.profile?.profilePhoto || "/default-avatar.png"
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNestedChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings({ ...settings, profilePhoto: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Validate passwords match if changing password
      if (settings.password && settings.password !== settings.confirmPassword) {
        setSaveStatus({ type: 'error', message: 'Passwords do not match' });
        return;
      }

      const formData = new FormData();
      Object.keys(settings).forEach(key => {
        if (key === 'socialLinks' || key === 'privacy' || key === 'preferences') {
          formData.append(key, JSON.stringify(settings[key]));
        } else if (key === 'certifications' || key === 'courses') {
          formData.append(key, JSON.stringify(settings[key]));
        } else if (key === 'profilePhoto' && settings[key]) {
          formData.append(key, settings[key]);
        } else if (key !== 'password' && key !== 'confirmPassword') {
          formData.append(key, settings[key]);
        }
      });

      if (settings.password) {
        formData.append("password", settings.password);
      }

      await axios.put(`${USER_API_END_POINT}/update-settings`, formData, {
        withCredentials: true,
      });

      dispatch(updateUserSettings(settings));
      setSaveStatus({ type: 'success', message: 'Settings updated successfully!' });
      
      // Clear password fields
      setSettings(prev => ({ ...prev, password: "", confirmPassword: "" }));
      
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ 
        type: 'error', 
        message: error.response?.data?.message || "Error updating settings." 
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm("Are you sure you want to delete your account? This action is irreversible!")
    )
      return;

    try {
      await axios.delete(`${USER_API_END_POINT}/delete-account`, {
        withCredentials: true,
      });
      dispatch(deleteAccount());
      toast.success("Account deleted successfully!");
    } catch (error) {
      toast.error("Error deleting account.");
    }
  };

  const handleAddCertification = () => {
    setSettings({ ...settings, certifications: [...settings.certifications, ""] });
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = [...settings.certifications];
    updatedCertifications.splice(index, 1);
    setSettings({ ...settings, certifications: updatedCertifications });
  };

  const handleCertificationChange = (e, index) => {
    const updatedCertifications = [...settings.certifications];
    updatedCertifications[index] = e.target.value;
    setSettings({ ...settings, certifications: updatedCertifications });
  };

  const handleAddCourse = () => {
    setSettings({ ...settings, courses: [...settings.courses, ""] });
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = [...settings.courses];
    updatedCourses.splice(index, 1);
    setSettings({ ...settings, courses: updatedCourses });
  };

  const handleCourseChange = (e, index) => {
    const updatedCourses = [...settings.courses];
    updatedCourses[index] = e.target.value;
    setSettings({ ...settings, courses: updatedCourses });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and personal information</p>
      </div>

      {/* Status Messages */}
      {saveStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          saveStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{saveStatus.message}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Additional
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Update your profile picture to help others recognize you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={previewImage} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {getInitials(settings.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, at least 200x200 pixels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={settings.fullname}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={settings.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={settings.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={settings.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={settings.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your location"
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.password ? "text" : "password"}
                      name="password"
                      value={settings.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.password ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={settings.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Set your language and timezone preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Regional Settings
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the platform looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Appearance Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    name="profileVisibility"
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleNestedChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="registered">Registered Users Only</option>
                    <option value="private">Private - Only you can view</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Email Address</label>
                      <p className="text-sm text-gray-500">Allow others to see your email</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => handleNestedChange('privacy', 'showEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Phone Number</label>
                      <p className="text-sm text-gray-500">Allow others to see your phone</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showPhone}
                      onCheckedChange={(checked) => handleNestedChange('privacy', 'showPhone', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Allow Messages</label>
                      <p className="text-sm text-gray-500">Let others send you messages</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onCheckedChange={(checked) => handleNestedChange('privacy', 'allowMessages', checked)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Privacy Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
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
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.preferences.emailNotifications}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={settings.preferences.pushNotifications}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                      <p className="text-sm text-gray-500">Receive notifications via text message</p>
                    </div>
                    <Switch
                      checked={settings.preferences.smsNotifications}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                      <p className="text-sm text-gray-500">Receive promotional and marketing content</p>
                    </div>
                    <Switch
                      checked={settings.preferences.marketingEmails}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'marketingEmails', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Job Alerts</label>
                      <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
                    </div>
                    <Switch
                      checked={settings.preferences.jobAlerts}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'jobAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Message Alerts</label>
                      <p className="text-sm text-gray-500">Get notified about new messages</p>
                    </div>
                    <Switch
                      checked={settings.preferences.messageAlerts}
                      onCheckedChange={(checked) => handleNestedChange('preferences', 'messageAlerts', checked)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Notification Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Tab */}
        <TabsContent value="additional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications & Skills
              </CardTitle>
              <CardDescription>
                Add your professional certifications and completed courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Certifications
                  </label>
                  {settings.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleCertificationChange(e, index)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter certification name"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddCertification} variant="outline" className="mt-2">
                    <Award className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Courses & Training
                  </label>
                  {settings.courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => handleCourseChange(e, index)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter course name"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveCourse(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddCourse} variant="outline" className="mt-2">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Additional Information
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={settings.socialLinks.linkedin}
                      onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Profile
                    </label>
                    <input
                      type="url"
                      value={settings.socialLinks.twitter}
                      onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinks.github}
                    onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  Save Social Links
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

// Re-export MainSettings for use in other components
export { MainSettings };