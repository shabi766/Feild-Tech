import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Lock, Save } from "lucide-react";

const PrivacySettings = ({ 
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
    </div>
  );
};

export default PrivacySettings;
