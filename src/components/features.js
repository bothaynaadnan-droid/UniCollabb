import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaYoutube, FaGoogle, FaLink, FaUsers, FaLightbulb, FaUserTie, FaStar, FaComments, FaStepForward, FaCheckCircle, FaHandshake, FaGraduationCap, FaTrophy } from 'react-icons/fa';
import './features.css';

const Features = () => {
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const featuresRef = useRef(null);

  const features = [
    {
      icon: <FaUsers />,
      title: 'User Management',
      description: 'Create profiles for students and supervisors with role-based access and university affiliations.',
      shape: 'user-shape',
      detailedDescription: 'Build your professional academic profile and connect with the right people in your field.',
      steps: [
        'Complete your profile with academic background and skills',
        'Choose your role (Student, Supervisor, or Both)',
        'Connect with your university and department',
        'Build your network by following other users'
      ],
      resources: [
        {
          title: 'Building Professional Academic Profiles',
          type: 'YouTube',
          link: 'https://www.youtube.com/results?search_query=academic+profile+building',
          icon: <FaYoutube />
        },
        {
          title: 'Academic Networking Strategies',
          type: 'Article',
          link: 'https://scholar.google.com/scholar?q=academic+networking+strategies',
          icon: <FaGoogle />
        }
      ],
      benefits: [
        'Professional visibility across universities',
        'Role-based access control',
        'Academic networking opportunities',
        'Skill-based team formation'
      ]
    },
    {
      icon: <FaLightbulb />,
      title: 'Project & Idea Management',
      description: 'Share project ideas, form teams, and manage your collaborative projects across institutions.',
      shape: 'idea-shape',
      detailedDescription: 'Transform your innovative ideas into successful IT projects with proper planning and team collaboration.',
      steps: [
        'Submit your project idea with detailed requirements',
        'Define project scope, technologies, and timeline',
        'Find team members with complementary skills',
        'Set up project milestones and deliverables',
        'Manage tasks and track progress collaboratively'
      ],
      resources: [
        {
          title: 'IT Project Management Tutorial',
          type: 'YouTube',
          link: 'https://www.youtube.com/results?search_query=IT+project+management+tutorial',
          icon: <FaYoutube />
        },
        {
          title: 'Agile Project Management for IT',
          type: 'Article',
          link: 'https://www.google.com/search?q=agile+project+management+IT',
          icon: <FaGoogle />
        },
        {
          title: 'GitHub Project Management',
          type: 'Resource',
          link: 'https://github.com/features/project-management',
          icon: <FaLink />
        }
      ],
      benefits: [
        'Structured project development process',
        'Cross-university collaboration',
        'Idea validation and feedback',
        'Comprehensive project tracking'
      ]
    },
    {
      icon: <FaUserTie />,
      title: 'Supervision & Feedback',
      description: 'Receive academic guidance and feedback from supervisors across multiple universities.',
      shape: 'supervision-shape',
      detailedDescription: 'Access experienced supervisors who can guide your IT project development and provide valuable industry insights.',
      steps: [
        'Browse available supervisors and their expertise',
        'Request supervision for your project',
        'Schedule regular progress review meetings',
        'Implement feedback and suggestions',
        'Maintain continuous communication'
      ],
      resources: [
        {
          title: 'Importance of Project Supervision',
          type: 'YouTube',
          link: 'https://www.youtube.com/results?search_query=project+supervision+importance',
          icon: <FaYoutube />
        },
        {
          title: 'Effective Feedback in IT Projects',
          type: 'Article',
          link: 'https://scholar.google.com/scholar?q=effective+feedback+IT+projects',
          icon: <FaGoogle />
        }
      ],
      benefits: [
        'Expert guidance from experienced professionals',
        'Quality assurance for your projects',
        'Industry insights and best practices',
        'Academic and professional mentorship'
      ],
      importance: 'Having experienced supervisors provides direction, prevents common pitfalls, and accelerates your learning curve in IT project development.'
    },
    {
      icon: <FaStar />,
      title: 'Evaluation & Rating',
      description: 'Rate projects and team members with our 5-star system to foster positive competition.',
      shape: 'rating-shape',
      detailedDescription: 'Create a constructive environment where feedback drives improvement and healthy competition inspires excellence.',
      steps: [
        'Rate completed projects based on predefined criteria',
        'Provide constructive feedback to team members',
        'Receive ratings and suggestions for improvement',
        'Learn from peer evaluations and best practices'
      ],
      resources: [
        {
          title: 'Constructive Feedback Techniques',
          type: 'YouTube',
          link: 'https://www.youtube.com/results?search_query=constructive+feedback+techniques',
          icon: <FaYoutube />
        },
        {
          title: 'Peer Evaluation in Education',
          type: 'Article',
          link: 'https://scholar.google.com/scholar?q=peer+evaluation+in+education',
          icon: <FaGoogle />
        }
      ],
      benefits: [
        'Continuous improvement through feedback',
        'Recognition of excellent work',
        'Healthy competitive environment',
        'Quality benchmarking across projects'
      ],
      importance: 'Positive competition and constructive feedback create an environment where students motivate each other to excel and learn from both successes and failures.'
    },
    {
      icon: <FaComments />,
      title: 'Communication & Notifications',
      description: 'Stay connected with real-time messaging, notifications, and collaborative tools.',
      shape: 'communication-shape',
      detailedDescription: 'Seamless communication across universities ensures smooth collaboration and timely project execution.',
      steps: [
        'Set up project-specific communication channels',
        'Receive real-time notifications for important updates',
        'Schedule meetings and coordinate across timezones',
        'Share files and resources securely',
        'Maintain communication logs for reference'
      ],
      resources: [
        {
          title: 'Effective Team Communication',
          type: 'YouTube',
          link: 'https://www.youtube.com/results?search_query=effective+team+communication',
          icon: <FaYoutube />
        },
        {
          title: 'Collaboration Tools for Students',
          type: 'Article',
          link: 'https://www.google.com/search?q=collaboration+tools+for+students',
          icon: <FaGoogle />
        }
      ],
      benefits: [
        'Real-time coordination with team members',
        'Instant updates from supervisors',
        'Cross-university communication',
        'Centralized project discussions'
      ],
      importance: 'Our notification system ensures you never miss important updates while facilitating smooth communication between students, supervisors, and across different universities.'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleFeatures(prev => [...prev, index]);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, [features.length]);

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  return (
    <section className="features" id="features" ref={featuresRef}>
      <div className="container">
        <div className="section-title">
          <h2>Platform Features</h2>
          <p>UniCollab provides all the tools you need for successful project collaboration and academic supervision</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${visibleFeatures.includes(index) ? 'visible' : ''} ${feature.shape}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
              onClick={() => handleFeatureClick(feature)}
            >
              <div className="feature-shape">
                <div className="feature-icon">
                  {feature.icon}
                </div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-click-hint">
                Click to learn more →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Detail Modal */}
      {isModalOpen && selectedFeature && (
        <div className="feature-modal active">
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <div className="feature-modal-icon">
                {selectedFeature.icon}
              </div>
              <div className="modal-title-section">
                <h2>{selectedFeature.title}</h2>
                <p className="modal-subtitle">{selectedFeature.detailedDescription}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>
                  <FaStepForward className="section-icon" />
                  How to Get Started
                </h3>
                <div className="steps-grid">
                  {selectedFeature.steps.map((step, index) => (
                    <div key={index} className="step-item">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">
                        <FaCheckCircle className="step-check" />
                        <span>{step}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>
                  <FaTrophy className="section-icon" />
                  Key Benefits
                </h3>
                <div className="benefits-list">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <FaHandshake className="benefit-icon" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFeature.importance && (
                <div className="modal-section importance-section">
                  <h3>
                    <FaGraduationCap className="section-icon" />
                    Why This Matters
                  </h3>
                  <div className="importance-content">
                    <p>{selectedFeature.importance}</p>
                  </div>
                </div>
              )}

              <div className="modal-section">
                <h3>
                  <FaGoogle className="section-icon" />
                  Learning Resources
                </h3>
                <div className="resources-grid">
                  {selectedFeature.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-card"
                    >
                      <div className="resource-icon">
                        {resource.icon}
                      </div>
                      <div className="resource-info">
                        <h4>{resource.title}</h4>
                        <span className="resource-type">{resource.type}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={closeModal}>
                Got it! Let's explore
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Features;