import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Save } from "lucide-react";

const NotificationsSettings = ({ 
  settings, 
  handleSubmit, 
  handleNestedChange, 
  isSaving 
}) => {
  return (
    <div className="space-y-8 max-w-4xl text-left animate-fade-in">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notification Preferences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how and when you want to be notified.</p>
        </div>

        <div className="card-elevated p-6 rounded-2xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications in browser' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via text message' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional and marketing content' },
                { key: 'jobAlerts', label: 'Job Alerts', desc: 'Get notified about new job opportunities' },
                { key: 'messageAlerts', label: 'Message Alerts', desc: 'Get notified about new messages' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                  <div>
                    <label className="text-sm font-medium text-foreground">{label}</label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences?.[key] || false}
                    onCheckedChange={(checked) => handleNestedChange('notificationPreferences', key, checked)}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isSaving} className="rounded-xl px-6 w-auto mt-4">
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default NotificationsSettings;
