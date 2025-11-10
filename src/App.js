import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import './App.css';
import Header from './components/header';
import Home from './pages/home';
import StudentDashboard from './pages/StudentDashboard';
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


function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setShowSignupModal(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Header 
            user={user}
            onShowLogin={() => setShowLoginModal(true)}
            onShowSignup={() => setShowSignupModal(true)}
            onLogout={handleLogout}
          />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            
            {/* Project Gallery - from header navigation */}
            <Route path="/projects" element={<ProjectsHeader />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            {/* Project Management - from dashboard actions */}
            <Route path="/projectspage" element={<Projectspage />} />
            
            <Route path="/student" element={<StudentProfile user={user} onLogout={handleLogout} />} />
            <Route path="/supervisor" element={<SupervisorDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notes-calendar" element={<NotesCalendarPage />} />
            <Route path="/messages" element={<div>Messages Page - Coming Soon</div>} />
            <Route path="/progress" element={<div>Progress Page - Coming Soon</div>} />
            
            {/* Fixed route - make sure this matches your navigation */}
            <Route path="/manage-project/:projectId" element={<ManageProject />} />
            <Route path="/supervisors" element={<Supervisors />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
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