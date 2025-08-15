import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { settings } = useSettings();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage first, then from settings
    return localStorage.getItem('appLanguage') || 'en';
  });

  useEffect(() => {
    // Only update if settings.language is different from current localStorage
    const storedLanguage = localStorage.getItem('appLanguage');
    const settingsLanguage = settings?.language;
    
    if (settingsLanguage && settingsLanguage !== storedLanguage) {
      setCurrentLanguage(settingsLanguage);
      localStorage.setItem('appLanguage', settingsLanguage);
      document.documentElement.lang = settingsLanguage;
    } else if (storedLanguage) {
      // Use stored language and apply it to document
      setCurrentLanguage(storedLanguage);
      document.documentElement.lang = storedLanguage;
    }
  }, [settings?.language]);

  const changeLanguage = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
    document.documentElement.lang = newLanguage;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
