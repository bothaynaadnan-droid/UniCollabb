import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Create Account',
      description: 'Sign up as a student or supervisor from your university'
    },
    {
      number: '2',
      title: 'Share Project Idea',
      description: 'Post your project idea or browse existing ones'
    },
    {
      number: '3',
      title: 'Join or Form Team',
      description: 'Register to join a team or create your own'
    },
    {
      number: '4',
      title: 'Collaborate & Get Feedback',
      description: 'Work with your team and receive supervisor guidance'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <div className="section-title">
          <h2>How UniCollab Works</h2>
          <p>Follow these simple steps to start collaborating on projects</p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;