import React, { useState } from 'react';
import { FaSearch, FaFilter, FaPlus, FaUsers, FaStar, FaClock, FaTimes, FaArrowLeft } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import './AllProjects.css';
import projectsData from '../../data/projectsData';

const AllProjects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [projects, setProjects] = useState(projectsData);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const fields = ['all', 'IT', 'AI', 'Engineering', 'Business', 'Science', 'Design'];

  const handleCreateProject = (projectData) => {
    const newProject = {
      id: projects.length + 1,
      ...projectData,
      status: 'planning',
      progress: 0,
      teamMembers: 1,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isOwner: true,
      skills: projectData.requiredSkills || []
    };
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = selectedField === 'all' || project.field === selectedField;
    return matchesSearch && matchesField;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i}
        className={i < rating ? 'star filled' : 'star'}
      />
    ));
  };

  return (
    <div className="all-projects">
      {/* Header with Search and Create Button */}
      <div className="projects-header">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select 
              value={selectedField} 
              onChange={(e) => setSelectedField(e.target.value)}
            >
              {fields.map(field => (
                <option key={field} value={field}>
                  {field === 'all' ? 'All Fields' : field}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3 className="project-title">{project.title}</h3>
              <span className={`project-status ${project.status}`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="project-details">
              <div className="detail-item">
                <span className="label">Field:</span>
                <span className="value">{project.field}</span>
              </div>
              <div className="detail-item">
                <span className="label">Supervisor:</span>
                <span className="value">{project.supervisorName || 'Not assigned'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Skills Needed:</span>
                <div className="skills-list">
                  {project.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="project-metrics">
              <div className="metric">
                <FaUsers className="metric-icon" />
                <span>{project.teamMembers}/{project.maxTeamSize} members</span>
              </div>
              <div className="metric">
                <FaClock className="metric-icon" />
                <span>{project.progress}% complete</span>
              </div>
              <div className="metric">
                <div className="rating-stars">
                  {renderStars(project.rating)}
                  <span>({project.rating})</span>
                </div>
              </div>
            </div>

            <div className="project-actions">
              {project.lookingForTeam && (
                <button className="btn join-btn">
                  Join Request
                </button>
              )}
              
              <button 
                className="btn view-btn"
                onClick={() => {
                  setSelectedProject(project);
                  setShowProjectModal(true);
                }}
              >
                View Details
              </button>
            </div>

            {project.lookingForTeam && (
              <div className="team-needed-badge">
                👥 Looking for Team Members
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="project-details-modal active">
          <div className="modal-overlay" onClick={() => setShowProjectModal(false)}></div>
          <div className="modal-content">
            <button 
              className="modal-close" 
              onClick={() => setShowProjectModal(false)}
            >
              <FaTimes />
            </button>

            <div className="modal-header">
              <button 
                className="back-to-dashboard-btn"
                onClick={() => setShowProjectModal(false)}
              >
                <FaArrowLeft /> Back
              </button>
              <div style={{ flex: 1 }}>
                <h2>{selectedProject.title}</h2>
                <span className={`project-status ${selectedProject.status}`}>
                  {selectedProject.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="modal-body">
              {/* Project Overview */}
              <section className="modal-section">
                <h3>Project Overview</h3>
                <p className="project-full-description">{selectedProject.detailedDescription || selectedProject.description}</p>
                
                <div className="project-info-grid">
                  <div className="info-card">
                    <label>Field</label>
                    <p>{selectedProject.field}</p>
                  </div>
                  <div className="info-card">
                    <label>Status</label>
                    <p>{selectedProject.status.toUpperCase()}</p>
                  </div>
                  <div className="info-card">
                    <label>Progress</label>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${selectedProject.progress}%` }}></div>
                    </div>
                    <p>{selectedProject.progress}% Complete</p>
                  </div>
                  <div className="info-card">
                    <label>Rating</label>
                    <div className="rating-display">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i}
                          className={i < selectedProject.rating ? 'star filled' : 'star'}
                        />
                      ))}
                      <span className="rating-text">({selectedProject.rating}/5)</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Supervisor Information */}
              <section className="modal-section">
                <h3>Supervisor</h3>
                <div className="supervisor-card">
                  <div className="supervisor-avatar">👨‍🏫</div>
                  <div className="supervisor-info">
                    <h4>{selectedProject.supervisorName || 'Not Assigned'}</h4>
                    {selectedProject.supervisor && (
                      <>
                        <p className="supervisor-detail">
                          <strong>University:</strong> {selectedProject.supervisor.university}
                        </p>
                        <p className="supervisor-detail">
                          <strong>Department:</strong> {selectedProject.supervisor.department}
                        </p>
                        <p className="supervisor-detail">
                          <strong>Email:</strong> {selectedProject.supervisor.email}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Team Members */}
              <section className="modal-section">
                <h3>Team Members ({selectedProject.teamMembers}/{selectedProject.maxTeamSize})</h3>
                <div className="team-members-list">
                  {(selectedProject.team || []).length > 0 ? (
                    (selectedProject.team || []).map((member, idx) => (
                      <div key={idx} className="team-member-card">
                        <div className="member-avatar">
                          {['👨‍💻', '👩‍💻', '🧑‍💻'][idx % 3]}
                        </div>
                        <div className="member-info">
                          <h5>{typeof member === 'string' ? member : member.name}</h5>
                          {typeof member !== 'string' && (
                            <>
                              <p className="member-role">{member.role}</p>
                              <p className="member-contribution">{member.contribution}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No team members yet</p>
                  )}
                </div>
                <div className="team-capacity">
                  <span className="capacity-text">
                    {selectedProject.maxTeamSize - selectedProject.teamMembers} spots available
                  </span>
                  {selectedProject.lookingForTeam && (
                    <span className="looking-badge">👥 Looking for Team Members</span>
                  )}
                </div>
              </section>

              {/* Materials & Tech Stack */}
              <section className="modal-section">
                <h3>Materials & Technologies</h3>
                <div className="materials-container">
                  {(selectedProject.tools || selectedProject.skills || []).length > 0 ? (
                    <div className="materials-grid">
                      {(selectedProject.tools || selectedProject.skills || []).map((material, idx) => (
                        <div key={idx} className="material-tag">
                          {material}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No materials listed</p>
                  )}
                </div>
              </section>

              {/* Feedback */}
              {(selectedProject.feedback || []).length > 0 && (
                <section className="modal-section">
                  <h3>Feedback & Reviews</h3>
                  <div className="feedback-container">
                    {(selectedProject.feedback || []).map((review, idx) => (
                      <div key={idx} className="feedback-card">
                        <div className="feedback-header">
                          <h5>{review.user}</h5>
                          <div className="feedback-rating">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i}
                                className={i < review.rating ? 'star filled' : 'star'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="feedback-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Information */}
              <section className="modal-section">
                <h3>Additional Information</h3>
                <div className="additional-info-grid">
                  <div className="info-card">
                    <label>Created Date</label>
                    <p>{selectedProject.createdAt}</p>
                  </div>
                  <div className="info-card">
                    <label>Required Skills</label>
                    <div className="skills-grid">
                      {(selectedProject.skills || []).map((skill, idx) => (
                        <span key={idx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProjectModal(false)}
              >
                Close
              </button>
              {selectedProject.lookingForTeam && (
                <button className="btn btn-primary">
                  Join Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProjects;