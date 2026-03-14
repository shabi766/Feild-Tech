import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Globe, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/Hooks/useTranslation";

const AccountSettings = ({ 
  settings, 
  showPasswords, 
  handleChange, 
  handleSubmit, 
  handleDeleteAccount,
  togglePasswordVisibility,
  isSaving 
}) => {
  const { t, currentLanguage } = useTranslation();
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <div className="space-y-8 max-w-4xl text-left animate-fade-in">
      
      {/* Security Settings */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> {t('securitySettings', currentLanguage) || 'Security'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('securitySettingsDesc', currentLanguage) || 'Update your password and secure your account.'}
          </p>
        </div>

        <div className="card-elevated p-6 rounded-2xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('newPassword', currentLanguage) || 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.password ? "text" : "password"}
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 pr-10 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={t('enterNewPassword', currentLanguage) || 'Enter new password'}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('confirmNewPassword', currentLanguage) || 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 pr-10 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={t('confirmNewPasswordPlaceholder', currentLanguage) || 'Confirm new password'}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="rounded-xl px-6 w-auto">
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  {t('updating', currentLanguage) || 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('saveChanges', currentLanguage) || 'Update Password'}
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" /> {t('dangerZone', currentLanguage) || 'Danger Zone'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('dangerZoneDesc', currentLanguage) || 'Irreversible and destructive actions.'}
          </p>
        </div>

        <div className="p-5 border border-destructive/20 rounded-2xl bg-destructive/5 max-w-2xl">
          <h4 className="font-semibold text-destructive mb-2">
            {t('deleteAccountTitle', currentLanguage) || 'Delete Account'}
          </h4>
          <p className="text-sm text-destructive/80 mb-5 leading-relaxed">
            {t('deleteAccountWarning', currentLanguage) || 'Once you delete your account, there is no going back. Please be certain.'}
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deleteAccountButton', currentLanguage) || 'I understand, delete my account'}
          </Button>
        </div>
      </section>

    </div>
  );
};

export default AccountSettings;
