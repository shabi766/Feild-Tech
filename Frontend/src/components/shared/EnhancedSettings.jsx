// This file has been refactored into smaller, manageable components
// Please use EnhancedSettingsRefactored from the Settings directory instead
//
// The original large component (944 lines) has been broken down into:
// - ProfileSettings.jsx
// - AccountSettings.jsx
// - PreferencesSettings.jsx
// - PrivacySettings.jsx
// - NotificationsSettings.jsx
// - AdditionalSettings.jsx
// - StatusMessage.jsx
// - EnhancedSettingsRefactored.jsx (main orchestrator)
//
// See: Frontend/src/components/shared/Settings/README.md for documentation

import { EnhancedSettingsRefactored } from './Settings';

const EnhancedSettings = () => {
  return <EnhancedSettingsRefactored />;
};

export default EnhancedSettings;

