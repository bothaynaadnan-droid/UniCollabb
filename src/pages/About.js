import React, { useState, useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const [counters, setCounters] = useState({
    students: 0,
    universities: 0,
    projects: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const missionRef = useRef(null);

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Buthayna Adnan",
      role: "Project Lead, UI/UX Designer & Frontend Developer",
      image: "👩‍💻",
      description: "Passionate about creating innovative solutions that bridge technology and education.",
      skills: ["React", "UI/UX Design", "Project Management"]
    },
    {
      id: 2,
      name: "Nour AL-qaisi",
      role: "Database Architect & Project Management & Documentation",
      image: "👩‍💼",
      description: "Dedicated to creating organized systems and comprehensive documentation for enhanced learning experiences.",
      skills: ["Database Design", "Project Management", "Documentation"]
    },
    {
      id: 3,
      name: "Rama Melhem",
      role: "Backend Developer & System Architect",
      image: "👩‍🔧",
      description: "Focused on building robust and scalable systems to support educational collaboration.",
      skills: ["C#", "ASP.NET Core", "APIs"]
    }
  ];

  // Supervisor data
  const supervisor = {
    name: "Dr. Malek Almomani",
    role: "Project Supervisor & Academic Mentor",
    image: "👨‍🏫",
    description: "Providing expert guidance and academic supervision to ensure the project's success and educational value.",
    department: "Computer Science Department",
    university: "WISE University"
  };

  // Features data
  const features = [
    {
      icon: "🎓",
      title: "Academic Excellence",
      description: "Built by students who understand the challenges of academic collaboration"
    },
    {
      icon: "🤝",
      title: "Cross-University Collaboration",
      description: "Breaking down barriers between institutions for better learning outcomes"
    },
    {
      icon: "💡",
      title: "Innovation Driven",
      description: "Leveraging modern technology to enhance traditional education methods"
    },
    {
      icon: "🌍",
      title: "Global Perspective",
      description: "Designed to connect students and supervisors across different universities"
    }
  ];

  // Intersection Observer for mission section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            startCounting();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      if (missionRef.current) {
        observer.unobserve(missionRef.current);
      }
    };
  }, []);

  // Counter animation
  const startCounting = () => {
    const targetValues = {
      students: 1000,
      universities: 50,
      projects: 200
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(targetValues).forEach(key => {
      let currentStep = 0;
      const target = targetValues[key];
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = Math.floor(target * progress);
        
        setCounters(prev => ({
          ...prev,
          [key]: currentValue
        }));

        if (currentStep === steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About UniCollab</h1>
            <p className="hero-subtitle">
              A Student Initiative from The World Islamic and Sciences Education (WISE) University
            </p>
            <div className="university-badge">
              <span className="badge-icon">🏫</span>
              <span className="badge-text">WISE University Project</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section" ref={missionRef}>
        <div className="container">
          <div className={`mission-grid ${isVisible ? 'visible' : ''}`}>
            <div className="mission-content">
              <h2 className={`mission-title ${isVisible ? 'slide-in-left' : ''}`}>Our Mission</h2>
              <p className={`mission-text ${isVisible ? 'slide-in-left' : ''}`}>
                At UniCollab, we believe that collaboration is the key to innovation in education. 
                As students of WISE University, we've experienced firsthand the challenges of 
                finding the right team members and supervisors for academic projects.
              </p>
              <p className={`mission-text ${isVisible ? 'slide-in-left' : ''}`}>
                Our mission is to create a digital ecosystem where students from different 
                universities can connect, share ideas, form teams, and receive guidance from 
                experienced supervisors - all in one unified platform.
              </p>
              <div className={`mission-stats ${isVisible ? 'slide-in-up' : ''}`}>
                <div className="stat">
                  <h3 className="counter">{counters.students}+</h3>
                  <p>Students Connected</p>
                </div>
                <div className="stat">
                  <h3 className="counter">{counters.universities}+</h3>
                  <p>Universities</p>
                </div>
                <div className="stat">
                  <h3 className="counter">{counters.projects}+</h3>
                  <p>Projects Completed</p>
                </div>
              </div>
            </div>
            <div className={`mission-visual ${isVisible ? 'slide-in-right' : ''}`}>
              <div className="visual-card">
                <div className="card-icon">🚀</div>
                <h4>Student-Led Innovation</h4>
                <p>Built by students, for students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supervisor Section */}
      <section className="supervisor-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Academic Supervisor</h2>
            <p>Guiding us with expertise and academic excellence</p>
          </div>
          <div className="supervisor-card">
            <div className="supervisor-avatar">
              {supervisor.image}
            </div>
            <div className="supervisor-info">
              <h3>{supervisor.name}</h3>
              <p className="supervisor-role">{supervisor.role}</p>
              <p className="supervisor-department">{supervisor.department}</p>
              <p className="supervisor-university">{supervisor.university}</p>
              <p className="supervisor-description">{supervisor.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-title">
            <h2>Meet Our Team</h2>
            <p>The passionate students from WISE University behind UniCollab</p>
          </div>
          <div className="team-grid">
            {teamMembers && teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="member-avatar">
                  {member.image}
                </div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
                <div className="member-skills">
                  {member.skills && member.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Values</h2>
            <p>What drives us to build a better educational collaboration platform</p>
          </div>
          <div className="values-grid">
            {features && features.map((feature, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* University Pride Section */}
      <section className="university-section">
        <div className="container">
          <div className="university-content">
            <div className="university-logo">
              <span className="wise-icon">🎓</span>
              <h3>WISE University</h3>
            </div>
            <div className="university-info">
              <h2>Proudly Representing WISE University</h2>
              <p>
                The World Islamic and Sciences Education University has provided us with 
                the knowledge, resources, and inspiration to create UniCollab. Our education 
                at WISE has taught us the importance of collaboration, innovation, and 
                making a positive impact in our community.
              </p>
              <div className="university-highlights">
                <div className="highlight">
                  <span className="highlight-icon">⭐</span>
                  <span>Excellence in Education</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">🌟</span>
                  <span>Innovation & Research</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">💫</span>
                  <span>Community Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Join Our Educational Revolution</h2>
            <p>Be part of the growing community that's transforming how students collaborate</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-outline">Contact Our Team</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;