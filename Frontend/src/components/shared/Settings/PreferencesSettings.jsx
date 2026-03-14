import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Palette, Globe, Clock, Calendar, DollarSign,
  Languages, Sun, Moon, Zap, Bell
} from 'lucide-react';
import { getAvailableLanguages, getAvailableCurrencies, getAvailableTimezones } from '@/utils/i18n';
import { useTranslation } from '@/Hooks/useTranslation';

const PreferencesSettings = ({ settings, updateSetting, isLoading, setSaveStatus }) => {
  const { t, currentLanguage } = useTranslation();
  const languages = getAvailableLanguages();
  const currencies = getAvailableCurrencies();
  const timezones = getAvailableTimezones();

  const handleSettingChange = async (key, value) => {
    try {
      await updateSetting(key, value);
      setSaveStatus({ type: 'success', message: t('settingUpdated', currentLanguage) || 'Setting updated' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus({ type: 'error', message: t('settingUpdateFailed', currentLanguage) || 'Update failed' });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      
      {/* Appearance Settings */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Appearance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Customize how the application looks on your device.</p>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 card-elevated rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${settings.darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <Label className="text-base font-medium text-foreground">
                  {settings.darkMode ? 'Dark Mode' : 'Light Mode'}
                </Label>
                <p className="text-sm text-muted-foreground">Adjust the visual theme of the dashboard.</p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              disabled={isLoading}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Regional Settings */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Regional & Language
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your language, currency, and time zone preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Languages className="w-4 h-4 text-muted-foreground" /> Language
            </Label>
            <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-muted-foreground">({lang.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-muted-foreground" /> Currency
            </Label>
            <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-mono w-4">{curr.symbol}</span>
                      <span>{curr.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">{curr.code}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" /> Timezone
            </Label>
            <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.code} value={tz.code}>
                    <div className="flex items-center gap-2 w-full">
                      <span>{tz.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">{tz.offset}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Date Format
            </Label>
            <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)} disabled={isLoading}>
              <SelectTrigger className="w-full rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Date Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Quick Toggles
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Fast access to commonly used preferences.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <button
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left"
            onClick={() => handleSettingChange('notifications', !settings.notifications)}
            disabled={isLoading}
          >
            <div className={`p-2 rounded-lg ${settings.notifications ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-foreground">Notifications</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {settings.notifications ? 'Currently enabled' : 'Currently disabled'}
              </div>
            </div>
          </button>

          <button
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left"
            onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
            disabled={isLoading}
          >
            <div className={`p-2 rounded-lg ${settings.darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
              {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-medium text-foreground">Theme</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {settings.darkMode ? 'Dark mode active' : 'Light mode active'}
              </div>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};

export default PreferencesSettings;
