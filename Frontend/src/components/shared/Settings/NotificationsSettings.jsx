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
    <div className="space-y-6">
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
                  checked={settings.notificationPreferences?.emailNotifications || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={settings.notificationPreferences?.pushNotifications || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive notifications via text message</p>
                </div>
                <Switch
                  checked={settings.notificationPreferences?.smsNotifications || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                  <p className="text-sm text-gray-500">Receive promotional and marketing content</p>
                </div>
                <Switch
                  checked={settings.notificationPreferences?.marketingEmails || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'marketingEmails', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Job Alerts</label>
                  <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
                </div>
                <Switch
                  checked={settings.notificationPreferences?.jobAlerts || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'jobAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Message Alerts</label>
                  <p className="text-sm text-gray-500">Get notified about new messages</p>
                </div>
                <Switch
                  checked={settings.notificationPreferences?.messageAlerts || false}
                  onCheckedChange={(checked) => handleNestedChange('notificationPreferences', 'messageAlerts', checked)}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              Save Notification Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;
