import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaGithub, FaFileAlt, FaArrowLeft, FaCheckCircle, FaUserTie, FaUsers } from 'react-icons/fa';
import './ProjectsHeader.css';

const ProjectDetails = () => {
  const { id } = useParams();

  // Sample project data - in real app, you'd fetch this by ID
  const projects = [
    // Same projects data as in Projects.jsx
    {
      id: 1,
      title: "AI Learning Assistant",
      description: "An intelligent tutoring system that provides personalized learning recommendations using machine learning algorithms. The system analyzes student performance and learning patterns to create customized study plans and recommend relevant resources.",
      detailedDescription: "This project addresses the challenge of personalized education by leveraging machine learning algorithms to create adaptive learning paths. The system processes student interaction data to identify knowledge gaps and recommend targeted learning materials. It features a responsive web interface, real-time analytics dashboard, and integration with popular learning management systems.",
      tools: ["Python", "TensorFlow", "React", "MongoDB", "Scikit-learn", "FastAPI"],
      rating: 4.8,
      tags: ["AI", "Machine Learning", "Education", "Personalization"],
      githubLink: "https://github.com/example/ai-learning-assistant",
      documentation: "https://docs.example.com/ai-learning-assistant",
      supervisor: {
        name: "Dr. Sarah Johnson",
        university: "Tech University",
        department: "Computer Science",
        email: "s.johnson@techuniv.edu"
      },
      team: [
        { name: "Alice Chen", role: "ML Engineer", contribution: "Developed recommendation algorithms" },
        { name: "Bob Smith", role: "Frontend Developer", contribution: "Built React interface and dashboards" },
        { name: "Carol Davis", role: "Backend Developer", contribution: "Implemented API and database design" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true, duration: "2 weeks", description: "Project scope definition and requirement analysis" },
        { phase: "Research & Design", completed: true, duration: "3 weeks", description: "Algorithm research and system architecture design" },
        { phase: "Development", completed: true, duration: "8 weeks", description: "Implementation of core features and integration" },
        { phase: "Testing", completed: true, duration: "2 weeks", description: "Quality assurance and user testing" },
        { phase: "Final Presentation", completed: true, duration: "1 week", description: "Documentation and project demonstration" }
      ],
      feedback: [
        { user: "Dr. Johnson", comment: "Excellent implementation of ML algorithms with robust performance metrics.", rating: 5 },
        { user: "Prof. Wilson", comment: "Great user interface design and comprehensive documentation.", rating: 4.5 },
        { user: "Industry Reviewer", comment: "Strong potential for real-world application in educational institutions.", rating: 5 }
      ]
    },
    // ... other projects (same as in Projects.jsx)
  ];

  const project = projects.find(p => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="error-message">
            <h2>Project Not Found</h2>
            <p>The project you're looking for doesn't exist.</p>
            <Link to="/projects" className="back-btn">
              <FaArrowLeft /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < Math.floor(rating) ? 'star filled' : 'star'}
          />
        ))}
        <span className="rating-number">({rating})</span>
      </div>
    );
  };

  return (
    <div className="project-details">
      <div className="container">
        {/* Back Button */}
        <Link to="/projects" className="back-btn">
          <FaArrowLeft /> Back to Projects
        </Link>

        {/* Project Header */}
        <div className="project-header-details">
          <div className="project-title-section">
            <h1>{project.title}</h1>
            {renderStars(project.rating)}
          </div>
          <p className="project-subtitle">{project.description}</p>
        </div>

        <div className="details-grid">
          {/* Main Content */}
          <div className="main-content">
            {/* Detailed Description */}
            <section className="detail-section">
              <h2>Project Overview</h2>
              <p>{project.detailedDescription}</p>
            </section>

            {/* Technologies */}
            <section className="detail-section">
              <h2>Technologies & Tools</h2>
              <div className="tools-grid">
                {project.tools.map((tool, index) => (
                  <div key={index} className="tool-card">
                    {tool}
                  </div>
                ))}
              </div>
            </section>

            {/* Project Links */}
            <section className="detail-section">
              <h2>Project Resources</h2>
              <div className="project-links-details">
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-btn github-btn"
                >
                  <FaGithub /> View on GitHub
                </a>
                <a 
                  href={project.documentation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-btn docs-btn"
                >
                  <FaFileAlt /> View Documentation
                </a>
              </div>
            </section>

            {/* Project Timeline */}
            <section className="detail-section">
              <h2>Project Timeline</h2>
              <div className="timeline">
                {project.timeline.map((stage, index) => (
                  <div key={index} className={`timeline-item ${stage.completed ? 'completed' : ''}`}>
                    <div className="timeline-marker">
                      {stage.completed && <FaCheckCircle />}
                    </div>
                    <div className="timeline-content">
                      <h4>{stage.phase}</h4>
                      <span className="timeline-duration">{stage.duration}</span>
                      <p>{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Feedback Section */}
            <section className="detail-section">
              <h2>Feedback & Reviews</h2>
              <div className="feedback-list">
                {project.feedback.map((review, index) => (
                  <div key={index} className="feedback-item">
                    <div className="feedback-header">
                      <strong>{review.user}</strong>
                      {renderStars(review.rating)}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
              
              {/* Comment Input (Placeholder) */}
              <div className="comment-input">
                <h4>Add Your Feedback</h4>
                <textarea 
                  placeholder="Share your thoughts about this project..."
                  className="comment-textarea"
                />
                <button className="submit-comment-btn">Submit Feedback</button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Supervisor Info */}
            <section className="sidebar-section">
              <h3>
                <FaUserTie className="section-icon" />
                Project Supervisor
              </h3>
              <div className="supervisor-card">
                <h4>{project.supervisor.name}</h4>
                <p>{project.supervisor.department}</p>
                <p className="university">{project.supervisor.university}</p>
                <a href={`mailto:${project.supervisor.email}`} className="contact-link">
                  {project.supervisor.email}
                </a>
              </div>
            </section>

            {/* Team Members */}
            <section className="sidebar-section">
              <h3>
                <FaUsers className="section-icon" />
                Team Members
              </h3>
              <div className="team-list">
                {project.team.map((member, index) => (
                  <div key={index} className="team-member">
                    <h4>{member.name}</h4>
                    <span className="member-role">{member.role}</span>
                    <p className="member-contribution">{member.contribution}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Project Tags */}
            <section className="sidebar-section">
              <h3>Project Tags</h3>
              <div className="tags-container">
                {project.tags.map((tag, index) => (
                  <span key={index} className="project-tag-large">#{tag}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;