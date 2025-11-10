import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCog, FaTimes, FaEdit, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ user, onShowLogin, onShowSignup, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  const SettingsSidebar = () => {
    return (
      <div className={`global-settings-sidebar ${showSettings ? 'active' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setShowSettings(false)}></div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3><FaCog /> Settings</h3>
            <button 
              className="close-sidebar"
              onClick={() => setShowSettings(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="sidebar-body">
            <div className="setting-group">
              <h4>Account Settings</h4>
              <div className="setting-item">
                <button className="setting-btn">
                  <FaEdit /> Edit Profile
                </button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Notification Preferences</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Privacy Settings</button>
              </div>
            </div>
            
            <div className="setting-group">
              <h4>App Settings</h4>
              <div className="setting-item">
                <button className="setting-btn">Language & Region</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Help & Support</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn logout-btn" onClick={onLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <div className="logo-icon">UC</div>
              <div className="logo-text-container">
                <div className="logo-text">UniCollab</div>
                <div className="logo-by-wise">by WISE</div>
              </div>
            </Link>
            <nav>
              <ul>
                <li>
                  <Link 
                    to="/"
                    className={isActive('/') ? 'active' : ''}
                  >
                    Home
                  </Link>
                </li>
                {user && (
                  <>
                    <li>
                      <Link 
                        to={user.type === 'student' ? '/student' : '/supervisor'}
                        className={isActive('/student') || isActive('/supervisor') ? 'active' : ''}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/projects"
                        className={isActive('/projects') ? 'active' : ''}
                      >
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/supervisors"
                        className={isActive('/supervisors') ? 'active' : ''}
                      >
                        Supervisors
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <span className="coming-soon">Universities</span>
                </li>
                <li>
                  <Link 
                    to="/about"
                    className={isActive('/about') ? 'active' : ''}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="header-right">
              {user && (
                <button 
                  className="settings-header-btn"
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                >
                  <FaCog />
                </button>
              )}
              <div className="auth-buttons">
                {user ? (
                  <>
                    <span className="welcome-text">Welcome, {user.name}</span>
                    <button className="btn btn-outline" onClick={onLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={onShowLogin}>
                      Login
                    </button>
                    <button className="btn btn-primary" onClick={onShowSignup}>
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Sidebar */}
      <SettingsSidebar />
    </>
  );
};

export default Header;