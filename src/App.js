import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import './App.css';
import './theme-utils.css';

import Header from './components/header';
import Home from './pages/home';
import SupervisorDashboard from './pages/SupervisorDashboard';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import About from './pages/About';
import StudentProfile from './pages/StudentProfile';
import Projectspage from './pages/Projectspage';
import ProjectsHeader from './pages/ProjectsHeader';
import ProjectDetails from './pages/ProjectDetails';
import ChatPage from './pages/ChatPage';
import NotesCalendarPage from './pages/NotesCalendarPage';
import ManageProject from './pages/ManageProject';
import Supervisors from './pages/Supervisors';
import ScrollToTop from './components/ScrollToTop';
import Universities from './pages/Universities';

function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogin = (userData) => {
    console.log('App.handleLogin', userData);
    try { localStorage.setItem('uc_user', JSON.stringify(userData)); } catch (e) {}
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleSignup = (userData) => {
    console.log('App.handleSignup', userData);
    try { localStorage.setItem('uc_user', JSON.stringify(userData)); } catch (e) {}
    setUser(userData);
    setShowSignupModal(false);
  };

  const handleUpdateUser = (updatedUser) => {
    try {
      localStorage.setItem('uc_user', JSON.stringify(updatedUser));
    } catch (e) {}
    setUser(updatedUser);
  };

  // Load persisted user on app start
  useEffect(() => {
    try {
      const stored = localStorage.getItem('uc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) { console.warn('Failed to read stored user', e); }
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('uc_user'); } catch (e) {}
    setUser(null);
    window.location.href = "/";
  };

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        
        <div className="App">
          <Header 
            user={user}
            onShowLogin={() => setShowLoginModal(true)}
            onShowSignup={() => setShowSignupModal(true)}
            onLogout={handleLogout}
          />

          <Routes>
            <Route path="/" element={<Home user={user} onSignup={handleSignup} onShowLogin={() => setShowLoginModal(true)} onShowSignup={() => setShowSignupModal(true)} />} />
            <Route path="/home" element={<Home user={user} onSignup={handleSignup} onShowLogin={() => setShowLoginModal(true)} onShowSignup={() => setShowSignupModal(true)} />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<ProjectsHeader />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projectspage" element={<Projectspage />} />
            <Route path="/student" element={<StudentProfile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
            <Route path="/supervisor" element={<SupervisorDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notes-calendar" element={<NotesCalendarPage />} />
            <Route path="/manage-project/:projectId" element={<ManageProject />} />
            <Route path="/supervisors" element={<Supervisors />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="*" element={<Home user={user} onSignup={handleSignup} onShowLogin={() => setShowLoginModal(true)} onShowSignup={() => setShowSignupModal(true)} />} />
          </Routes>

          {showLoginModal && (
            <LoginModal 
              onClose={() => setShowLoginModal(false)}
              onLogin={handleLogin}
              onSwitchToSignup={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
            />
          )}

          {showSignupModal && (
            <SignupModal 
              onClose={() => setShowSignupModal(false)}
              onSignup={handleSignup}
              onSwitchToLogin={() => {
                setShowSignupModal(false);
                setShowLoginModal(true);
              }}
            />
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;