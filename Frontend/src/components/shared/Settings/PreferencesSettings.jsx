import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Globe,
  Monitor,
  Clock,
  Calendar,
  DollarSign,
  Languages,
  Sun,
  Moon,
  Smartphone,
  Zap,
  Bell
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
      setSaveStatus({ type: 'success', message: t('settingUpdated', currentLanguage) });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: t('settingUpdateFailed', currentLanguage) });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 gradient-accent rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            {t('appearance', currentLanguage)}
          </CardTitle>
          <CardDescription>
            {t('appearanceDesc', currentLanguage)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-yellow-100 text-yellow-600'}`}>
                {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <Label className="text-base font-semibold">
                  {settings.darkMode ? t('darkMode', currentLanguage) : t('lightMode', currentLanguage)}
                </Label>
                <p className="text-sm text-gray-600">
                  {t('darkModeDesc', currentLanguage)}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              disabled={isLoading}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Theme Preview */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${settings.darkMode
              ? 'bg-gray-900 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${settings.darkMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <div className={`w-3 h-3 rounded-full ${settings.darkMode ? 'bg-yellow-500' : 'bg-yellow-500'}`}></div>
              <div className={`w-3 h-3 rounded-full ${settings.darkMode ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-sm">
              {settings.darkMode
                ? t('darkModeDesc', currentLanguage)
                : t('lightModeDesc', currentLanguage)
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            {t('regionalAndLanguage', currentLanguage)}
          </CardTitle>
          <CardDescription>
            {t('regionalAndLanguageDesc', currentLanguage)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t('language', currentLanguage)}
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectLanguage', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-gray-500">({lang.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('languageDesc', currentLanguage)}
            </p>
          </div>

          <Separator />

          {/* Currency Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('currency', currentLanguage)}
            </Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleSettingChange('currency', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectCurrency', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{curr.symbol}</span>
                      <span>{curr.name}</span>
                      <Badge variant="outline" className="ml-auto">{curr.code}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('currencyDesc', currentLanguage)}
            </p>
          </div>

          <Separator />

          {/* Timezone Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('timezone', currentLanguage)}
            </Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => handleSettingChange('timezone', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectTimezone', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.code} value={tz.code}>
                    <div className="flex items-center gap-2">
                      <span>{tz.name}</span>
                      <Badge variant="outline" className="ml-auto">{tz.offset}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('timezoneDesc', currentLanguage)}
            </p>
          </div>

          <Separator />

          {/* Date Format */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('dateFormat', currentLanguage)}
            </Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => handleSettingChange('dateFormat', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectDateFormat', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY ({t('usFormat', currentLanguage)})</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY ({t('europeanFormat', currentLanguage)})</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD ({t('isoFormat', currentLanguage)})</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('dateFormatDesc', currentLanguage)}
            </p>
          </div>

          <Separator />

          {/* Time Format */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('timeFormat', currentLanguage)}
            </Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(value) => handleSettingChange('timeFormat', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectTimeFormat', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-{t('hourFormat', currentLanguage)} (AM/PM)</SelectItem>
                <SelectItem value="24h">24-{t('hourFormat', currentLanguage)} ({t('militaryTime', currentLanguage)})</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('timeFormatDesc', currentLanguage)}
            </p>
          </div>

          <Separator />

          {/* Week Start */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('weekStart', currentLanguage)}
            </Label>
            <Select
              value={settings.weekStart}
              onValueChange={(value) => handleSettingChange('weekStart', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectWeekStart', currentLanguage)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">{t('monday', currentLanguage)}</SelectItem>
                <SelectItem value="sunday">{t('sunday', currentLanguage)}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {t('weekStartDesc', currentLanguage)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {t('quickActions', currentLanguage)}
          </CardTitle>
          <CardDescription>
            {t('quickActionsDesc', currentLanguage)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => handleSettingChange('notifications', !settings.notifications)}
              disabled={isLoading}
            >
              <Bell className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">{t('notifications', currentLanguage)}</div>
                <div className="text-sm text-gray-600">
                  {settings.notifications ? t('enabled', currentLanguage) : t('disabled', currentLanguage)}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent/10 hover:border-accent/30"
              onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
              disabled={isLoading}
            >
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-accent" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600" />
              )}
              <div className="text-left">
                <div className="font-semibold">{t('theme', currentLanguage)}</div>
                <div className="text-sm text-gray-600">
                  {settings.darkMode ? t('dark', currentLanguage) : t('light', currentLanguage)}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesSettings;
