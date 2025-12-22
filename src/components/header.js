import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCog, FaTimes, FaEdit, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ user, onShowLogin, onShowSignup, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  // Character options for students
  const studentCharacterOptions = [
    { id: 1, emoji: '👾', category: 'male' },
    { id: 2, emoji: '🌸', category: 'female' },
    { id: 3, emoji: '👨‍🎓', category: 'male' },
    { id: 4, emoji: '👩‍🎓', category: 'female' },
    { id: 5, emoji: '🧑‍💻', category: 'male' },
    { id: 6, emoji: '👩‍💻', category: 'female' },
    { id: 7, emoji: '🤖', category: 'male' },
    { id: 8, emoji: '🥷', category: 'female' }
  ];

  // Character options for supervisors
  const supervisorCharacterOptions = [
    { id: 1, emoji: '👨‍🏫', category: 'male' },
    { id: 2, emoji: '👩‍🏫', category: 'female' },
    { id: 3, emoji: '🧑‍🏫', category: 'neutral' },
    { id: 4, emoji: '👨‍💼', category: 'male' },
    { id: 5, emoji: '👩‍💼', category: 'female' },
    { id: 6, emoji: '🧑‍💼', category: 'neutral' }
  ];

  // Get the user's selected character emoji
  const getUserCharacterEmoji = () => {
    if (!user || !user.characterId) return '👤'; // Default fallback
    
    const options = user.type === 'student' ? studentCharacterOptions : supervisorCharacterOptions;
    const selectedCharacter = options.find(char => char.id === user.characterId);
    return selectedCharacter ? selectedCharacter.emoji : '👤';
  };

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

  // Check if profile path is active
  const isProfileActive = () => {
    return location.pathname === '/student' || location.pathname === '/supervisor';
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
                    className={location.pathname === '/' ? 'active' : ''}
                  >
                    Home
                  </Link>
                </li>
                {user && (
                  <>
                    <li>
                      <Link 
                        to="/projects"
                        className={location.pathname === '/projects' ? 'active' : ''}
                      >
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/supervisors"
                        className={location.pathname === '/supervisors' ? 'active' : ''}
                      >
                        Supervisors
                      </Link>
                    </li>
                  </>
                )}
                <li>
                      <Link 
                        to="/universities"
                        className={location.pathname === '/universities' ? 'active' : ''}
                      >
                        Universities
                      </Link>
                    </li>
                <li>
                  <Link 
                    to="/about"
                    className={location.pathname === '/about' ? 'active' : ''}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="header-right">
              <div className="auth-buttons">
                {user ? (
                  <span className="welcome-text">Welcome, {user.name}</span>
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
              
              {user && (
                <div className="header-icons">
                  <button 
                    className="settings-header-btn"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                  >
                    <FaCog />
                  </button>
                  <Link 
                    to={user.type === 'student' ? '/student' : '/supervisor'}
                    className={`profile-header-btn ${isProfileActive() ? 'active' : ''}`}
                    title="Profile"
                  >
                    <span className="character-emoji">{getUserCharacterEmoji()}</span>
                  </Link>
                </div>
              )}
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