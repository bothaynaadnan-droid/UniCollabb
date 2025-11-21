import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import './ThemeSettings.css';

const ThemeSettings = () => {
  const { 
    isDarkMode, 
    currentTheme, 
    themes, 
    toggleDarkMode, 
    changeTheme 
  } = useTheme();

  return (
    <div className="theme-settings">
      <h3>Theme Settings</h3>
      
      {/* Dark Mode Toggle */}
      <div className="setting-group">
        <label className="setting-label">Dark Mode</label>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="dark-mode-toggle"
            checked={isDarkMode}
            onChange={toggleDarkMode}
            className="toggle-input"
          />
          <label htmlFor="dark-mode-toggle" className="toggle-slider">
            <span className="toggle-knob"></span>
            <span className="toggle-text-on">🌙</span>
            <span className="toggle-text-off">☀️</span>
          </label>
        </div>
      </div>

      {/* Color Themes */}
      <div className="setting-group">
        <label className="setting-label">Color Theme</label>
        <div className="theme-grid">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              onClick={() => changeTheme(key)}
            >
              <div 
                className="theme-preview"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)` 
                }}
              >
                <div className="theme-check">✓</div>
              </div>
              <span className="theme-name">{theme.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Preview */}
      <div className="theme-preview-card">
        <div 
          className="preview-header"
          style={{ 
            background: `linear-gradient(135deg, ${themes[currentTheme].primary} 0%, ${themes[currentTheme].primaryDark} 100%)` 
          }}
        >
          <h4>Preview</h4>
        </div>
        <div className="preview-content">
          <div className="preview-button" style={{ backgroundColor: themes[currentTheme].primary }}>
            Primary Button
          </div>
          <div className="preview-text">
            <p>This is how text will appear in {isDarkMode ? 'dark' : 'light'} mode with the {themes[currentTheme].name} theme.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;