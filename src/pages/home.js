import React, { useState } from 'react';
import Hero from '../components/hero';
import SearchSection from '../components/SearchSection';
import Features from '../components/features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/footer';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

const Home = ({ onShowLogin, onShowSignup }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <>
      <Hero 
        onGetStarted={() => setShowSignupModal(true)}
      />
      <SearchSection />
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
          onSignup={onShowSignup}
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