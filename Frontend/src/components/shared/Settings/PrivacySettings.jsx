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
    <div className="space-y-8 max-w-4xl text-left animate-fade-in">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Profile Visibility
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Control who can see your profile information.</p>
        </div>

        <div className="card-elevated p-6 rounded-2xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Visibility Level
              </label>
              <select
                name="profileVisibility"
                value={settings.privacy?.profileVisibility || 'public'}
                onChange={(e) => handleNestedChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="registered">Registered Users Only</option>
                <option value="private">Private - Only you can view</option>
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <label className="text-sm font-medium text-foreground">Show Email Address</label>
                  <p className="text-xs text-muted-foreground">Allow others to see your email</p>
                </div>
                <Switch
                  checked={settings.privacy?.showEmail || false}
                  onCheckedChange={(checked) => handleNestedChange('privacy', 'showEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <label className="text-sm font-medium text-foreground">Show Phone Number</label>
                  <p className="text-xs text-muted-foreground">Allow others to see your phone</p>
                </div>
                <Switch
                  checked={settings.privacy?.showPhone || false}
                  onCheckedChange={(checked) => handleNestedChange('privacy', 'showPhone', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                <div>
                  <label className="text-sm font-medium text-foreground">Allow Messages</label>
                  <p className="text-xs text-muted-foreground">Let others send you messages</p>
                </div>
                <Switch
                  checked={settings.privacy?.allowMessages || false}
                  onCheckedChange={(checked) => handleNestedChange('privacy', 'allowMessages', checked)}
                />
              </div>
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
                  Save Privacy Settings
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PrivacySettings;
