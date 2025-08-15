import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('timezone') || 'UTC';
  });

  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'MM/DD/YYYY';
  });

  const [timeFormat, setTimeFormat] = useState(() => {
    return localStorage.getItem('timeFormat') || '12h';
  });

  const [weekStart, setWeekStart] = useState(() => {
    return localStorage.getItem('weekStart') || 'monday';
  });

  // Apply dark mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Update document direction for RTL languages
    if (['ar', 'he'].includes(language)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  // Save timezone preference
  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  // Save date format preference
  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  // Save time format preference
  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  // Save week start preference
  useEffect(() => {
    localStorage.setItem('weekStart', weekStart);
  }, [weekStart]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const value = {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    currency,
    setCurrency,
    language,
    setLanguage,
    timezone,
    setTimezone,
    dateFormat,
    setDateFormat,
    timeFormat,
    setTimeFormat,
    weekStart,
    setWeekStart,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
