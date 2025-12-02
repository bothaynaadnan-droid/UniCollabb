import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('defult'); // red, blue, green, purple

  // Available themes
  const themes = {
    defult: {
      primary: '#03a3bfd9',
      primaryLight: '#f7b4aeff',
      primaryDark: '#69025ad7',
      name: 'Red Passion'
    },
    blue: {
      primary: '#0d3761ff',
      primaryLight: '#63a4ff',
      primaryDark: '#0decfcff',
      name: 'Blue Ocean'
    },
    green: {
      primary: '#035f07ff',
      primaryLight: '#6abf69',
      primaryDark: '#89e096ff',
      name: 'Green Forest'
    },
    purple: {
      primary: '#7b1fa2',
      primaryLight: '#ae52d4',
      primaryDark: '#4a0072',
      name: 'Purple Majesty'
    }
    
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('theme', currentTheme);
    updateCSSVariables();
  }, [isDarkMode, currentTheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  const updateCSSVariables = () => {
    const root = document.documentElement;
    const theme = themes[currentTheme];
    
    // Update primary colors
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--primary-dark', theme.primaryDark);

    // Update dark/light mode
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      root.style.setProperty('--light', '#1a1a1a');
      root.style.setProperty('--dark', '#ffffff');
      root.style.setProperty('--secondary', '#2d2d2d');
      root.style.setProperty('--gray', '#b0b0b0');
      root.style.setProperty('--gray-light', '#404040');
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--bg-tertiary', '#3d3d3d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--border-color', '#404040');
    } else {
      document.body.classList.remove('dark-mode');
      root.style.setProperty('--light', '#ffffff');
      root.style.setProperty('--dark', '#212121');
      root.style.setProperty('--secondary', '#f5f5f5');
      root.style.setProperty('--gray', '#757575');
      root.style.setProperty('--gray-light', '#e0e0e0');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f5f5f5');
      root.style.setProperty('--bg-tertiary', '#eeeeee');
      root.style.setProperty('--text-primary', '#212121');
      root.style.setProperty('--text-secondary', '#757575');
      root.style.setProperty('--border-color', '#e0e0e0');
    }
  };

  const value = {
    isDarkMode,
    currentTheme,
    themes,
    toggleDarkMode,
    changeTheme,
    currentThemeConfig: themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};