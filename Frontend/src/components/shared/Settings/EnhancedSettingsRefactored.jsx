import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings, deleteAccount } from "@/redux/userSlice";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Lock, 
  FileText
} from "lucide-react";
import axios from "axios";
import { USER_API_END_POINT } from "@/components/utils/constant";

// Import the smaller components
import ProfileSettings from "./ProfileSettings";
import AccountSettings from "./AccountSettings";
import PreferencesSettings from "./PreferencesSettings";
import PrivacySettings from "./PrivacySettings";
import NotificationsSettings from "./NotificationsSettings";
import AdditionalSettings from "./AdditionalSettings";
import StatusMessage from "./StatusMessage";

const EnhancedSettingsRefactored = () => {
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
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible!"))
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
      <StatusMessage saveStatus={saveStatus} />

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
        <TabsContent value="profile">
          <ProfileSettings
            settings={settings}
            previewImage={previewImage}
            handleChange={handleChange}
            handleProfilePhotoChange={handleProfilePhotoChange}
            handleSubmit={handleSubmit}
            isSaving={isSaving}
            getInitials={getInitials}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <AccountSettings
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
        <TabsContent value="preferences">
          <PreferencesSettings
            settings={settings}
            handleSubmit={handleSubmit}
            isSaving={isSaving}
            setSettings={setSettings}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <PrivacySettings
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleNestedChange}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationsSettings
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleNestedChange}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Additional Tab */}
        <TabsContent value="additional">
          <AdditionalSettings
            settings={settings}
            handleSubmit={handleSubmit}
            handleNestedChange={handleNestedChange}
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
    </div>
  );
};

export default EnhancedSettingsRefactored;
