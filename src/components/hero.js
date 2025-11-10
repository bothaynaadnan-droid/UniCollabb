import React from 'react';

const Hero = ({ onGetStarted }) => {
  return (
    <section className="hero">
      {/* Background Lighting Effects */}
      <div className="background-lighting">
        <div className="light-beam light-beam-1"></div>
        <div className="light-beam light-beam-2"></div>
        <div className="light-beam light-beam-3"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="character"></div>
          <h1>Collaborate. Innovate. Succeed.</h1>
          <p>UniCollab connects students and supervisors across universities to share project ideas, form teams, and receive academic guidance in a unified digital environment.</p>
          <div className="get-started-container">
            <button 
              className="btn btn-primary get-started-btn eye-catch" 
              onClick={onGetStarted}
            >
              Get Started
              <div className="button-glow"></div>
              <div className="button-sparkles">
               
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;