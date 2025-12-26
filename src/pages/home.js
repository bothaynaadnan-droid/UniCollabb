import React, { useState } from 'react';
import Hero from '../components/hero';
import { useNavigate } from 'react-router-dom';
import Features from '../components/features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/footer';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

const Home = ({ user, onShowLogin, onShowSignup, onSignup }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      // signed in -> go to create project page
      navigate('/projectspage');
    } else {
      // not signed in -> open signup modal
      setShowSignupModal(true);
    }
  };

  return (
    <>
      <Hero 
        onGetStarted={handleGetStarted}
      />
      <Features />
      <HowItWorks />
      <Footer />
      
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={onShowLogin}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
      )}
      
      {showSignupModal && (
        <SignupModal 
          onClose={() => setShowSignupModal(false)}
          onSignup={onSignup}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </>
  );
};

export default Home;