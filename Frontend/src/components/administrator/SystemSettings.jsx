import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Database, Mail, CreditCard, Info, CheckCircle, AlertCircle, RefreshCw, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { ADMINISTRATION_API_END_POINT } from '../utils/constant';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // System settings data
  const [settings, setSettings] = useState({
    general: {
      platformName: '',
      platformDescription: '',
      timezone: '',
      dateFormat: '',
      language: '',
      maintenanceMode: false
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      passwordMinLength: 8,
      enableAuditLog: true,
      ipWhitelist: []
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableSSL: true
    },
    payment: {
      stripeEnabled: false,
      paypalEnabled: false,
      defaultCurrency: 'USD',
      transactionFee: 2.9,
      minimumWithdrawal: 10,
      maximumWithdrawal: 10000
    },
    integrations: {
      googleAnalytics: '',
      facebookPixel: '',
      slackWebhook: '',
      webhookUrl: '',
      apiRateLimit: 1000
    }
  });

  const [showPasswords, setShowPasswords] = useState({
    smtpPassword: false
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${ADMINISTRATION_API_END_POINT}/settings`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSettings(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch settings');
      }
      
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handlePasswordUpdate = async (category, key, value) => {
    try {
      // Update local state immediately for UI responsiveness
      handleSettingChange(category, key, value);
      
      // If it's an email password, we need to save it immediately
      if (category === 'email' && key === 'smtpPassword') {
        setIsSaving(true);
        
        const response = await axios.put(`${ADMINISTRATION_API_END_POINT}/settings/${category}`, 
          { [key]: value }, 
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setSaveStatus({ type: 'success', message: 'Email password updated successfully' });
          setTimeout(() => setSaveStatus(null), 3000);
        } else {
          throw new Error(response.data.message || 'Failed to update password');
        }
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setSaveStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update password' 
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (category) => {
    try {
      setIsSaving(true);
      setSaveStatus(null);
      
      const response = await axios.put(`${ADMINISTRATION_API_END_POINT}/settings/${category}`, 
        settings[category], 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSaveStatus({ type: 'success', message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully` });
        setLastUpdated(new Date());
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
      
    } catch (err) {
      console.error(`Error saving ${category} settings:`, err);
      setSaveStatus({ 
        type: 'error', 
        message: err.response?.data?.message || `Failed to save ${category} settings` 
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      setSaveStatus(null);
      
      const response = await axios.put(`${ADMINISTRATION_API_END_POINT}/settings`, 
        settings, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setSaveStatus({ type: 'success', message: 'All settings saved successfully' });
        setLastUpdated(new Date());
        
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save all settings');
      }
      
    } catch (err) {
      console.error('Error saving all settings:', err);
      setSaveStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to save all settings' 
      });
      
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async (category) => {
    try {
      const response = await axios.post(`${ADMINISTRATION_API_END_POINT}/settings/${category}/reset`, {}, 
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Refresh settings after reset
        await fetchSettings();
        
        setSaveStatus({ type: 'success', message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings reset to defaults` });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to reset settings');
      }
      
    } catch (err) {
      console.error(`Error resetting ${category} settings:`, err);
      setSaveStatus({ 
        type: 'error', 
        message: err.response?.data?.message || `Failed to reset ${category} settings` 
      });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.general.platformName}
            onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter platform name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select timezone</option>
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform Description
        </label>
        <textarea
          value={settings.general.platformDescription}
          onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter platform description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select date format</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
          Enable maintenance mode
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="5"
            max="1440"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="3"
            max="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Minimum Length
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="6"
            max="32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IP Whitelist
          </label>
          <textarea
            value={settings.security.ipWhitelist.join('\n')}
            onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter IP addresses (one per line)"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireTwoFactor"
            checked={settings.security.requireTwoFactor}
            onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="requireTwoFactor" className="ml-2 text-sm text-gray-700">
            Require two-factor authentication for administrators
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableAuditLog"
            checked={settings.security.enableAuditLog}
            onChange={(e) => handleSettingChange('security', 'enableAuditLog', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableAuditLog" className="ml-2 text-sm text-gray-700">
            Enable audit logging for all administrative actions
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="65535"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.email.smtpUser}
            onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your-email@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.smtpPassword ? "text" : "password"}
              value={settings.email.smtpPassword}
              onChange={(e) => handlePasswordUpdate('email', 'smtpPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter SMTP password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('smtpPassword')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.smtpPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="noreply@yourplatform.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Platform Name"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableSSL"
          checked={settings.email.enableSSL}
          onChange={(e) => handleSettingChange('email', 'enableSSL', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="enableSSL" className="ml-2 text-sm text-gray-700">
          Enable SSL/TLS encryption
        </label>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Currency
          </label>
          <select
            value={settings.payment.defaultCurrency}
            onChange={(e) => handleSettingChange('payment', 'defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Fee (%)
          </label>
          <input
            type="number"
            value={settings.payment.transactionFee}
            onChange={(e) => handleSettingChange('payment', 'transactionFee', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="10"
            step="0.1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Withdrawal Amount
          </label>
          <input
            type="number"
            value={settings.payment.minimumWithdrawal}
            onChange={(e) => handleSettingChange('payment', 'minimumWithdrawal', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Withdrawal Amount
          </label>
          <input
            type="number"
            value={settings.payment.maximumWithdrawal}
            onChange={(e) => handleSettingChange('payment', 'maximumWithdrawal', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="stripeEnabled"
            checked={settings.payment.stripeEnabled}
            onChange={(e) => handleSettingChange('payment', 'stripeEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="stripeEnabled" className="ml-2 text-sm text-gray-700">
            Enable Stripe payments
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="paypalEnabled"
            checked={settings.payment.paypalEnabled}
            onChange={(e) => handleSettingChange('payment', 'paypalEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="paypalEnabled" className="ml-2 text-sm text-gray-700">
            Enable PayPal payments
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={settings.integrations.googleAnalytics}
            onChange={(e) => handleSettingChange('integrations', 'googleAnalytics', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="GA-XXXXXXXXX-X"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook Pixel ID
          </label>
          <input
            type="text"
            value={settings.integrations.facebookPixel}
            onChange={(e) => handleSettingChange('integrations', 'facebookPixel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="XXXXXXXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slack Webhook URL
          </label>
          <input
            type="url"
            value={settings.integrations.slackWebhook}
            onChange={(e) => handleSettingChange('integrations', 'slackWebhook', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Rate Limit (requests per hour)
          </label>
          <input
            type="number"
            value={settings.integrations.apiRateLimit}
            onChange={(e) => handleSettingChange('integrations', 'apiRateLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="100"
            max="10000"
            step="100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={settings.integrations.webhookUrl}
          onChange={(e) => handleSettingChange('integrations', 'webhookUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://your-webhook-endpoint.com/webhook"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'integrations':
        return renderIntegrationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ];

  if (loading && !lastUpdated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading system settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure platform-wide settings and integrations
            {lastUpdated && (
              <span className="ml-2 text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            saveStatus.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{saveStatus.message}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {renderContent()}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
          <button
            onClick={() => handleReset(activeTab)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={() => handleSave(activeTab)}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;