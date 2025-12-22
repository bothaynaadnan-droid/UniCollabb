import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaGithub, FaFileAlt, FaArrowLeft, FaCheckCircle, FaUserTie, FaUsers } from 'react-icons/fa';
import '../styles/ProjectsHeader.css';
import projectsData from '../data/projectsData';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // read simple user flag from localStorage (set by Login/Signup modals)
  let user = null;
  try {
    const raw = localStorage.getItem('uc_user');
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    user = null;
  }

  // Use shared projects data
  const projects = projectsData;

  if (!user) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="error-message">
            <h2>Login Required</h2>
            <p>You must be logged in or signed up to view project details.</p>
            <button className="back-btn" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

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
                {(project.tools || []).map((tool, index) => (
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
                {(project.timeline || []).map((stage, index) => (
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
                {(project.feedback || []).map((review, index) => (
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
                {(project.team || []).map((member, index) => (
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
                {(project.tags || []).map((tag, index) => (
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