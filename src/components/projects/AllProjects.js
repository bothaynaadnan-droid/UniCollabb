import React, { useEffect, useState } from 'react';
import { FaSearch, FaFilter, FaPlus, FaUsers, FaStar, FaClock, FaTimes, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import '../../styles/AllProjects.css';
import { buildProjectRequirements, createProject, listProjects, mapApiProjectToUi } from '../../api/projects';
import { getStoredUser } from '../../api/session';
import { createJoinRequest } from '../../api/joinRequests';
import { createSupervisorRequest } from '../../api/supervisorRequests';

const AllProjects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinProjectData, setJoinProjectData] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [joinMessage, setJoinMessage] = useState('');

  const loadProjects = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const apiProjects = await listProjects();
      const uiProjects = (apiProjects || []).map(mapApiProjectToUi);
      setProjects(uiProjects);
    } catch (e) {
      setLoadError(e?.response?.data?.message || e?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const fields = ['all', 'IT', 'AI', 'Engineering', 'Business', 'Science', 'Design'];

  const handleCreateProject = (projectData) => {
    // Persist to backend if logged in and student record exists.
    const currentUser = getStoredUser();
    const creatorId = currentUser?.studentId;
    if (!creatorId) {
      alert('⚠️ لا يمكن إنشاء مشروع بدون Student Profile (studentId غير موجود).');
      return;
    }

    const visibility = projectData.projectType === 'private' ? 'private' : 'public';
    const requirements = buildProjectRequirements({
      field: projectData.field,
      requiredSkills: projectData.requiredSkills,
      maxTeamSize: projectData.maxTeamSize,
      lookingForTeam: projectData.lookingForTeam,
      supervisorName: projectData.supervisorName || ''
    });

    (async () => {
      try {
        const created = await createProject({
          title: projectData.title,
          description: projectData.description,
          creator_id: creatorId,
          supervisor_id: null,
          visibility,
          requirements
        });

        const createdProjectId = created?.data?.id;

        if (createdProjectId && projectData?.supervisorId) {
          try {
            await createSupervisorRequest({
              projectId: createdProjectId,
              supervisorId: projectData.supervisorId,
              message: null
            });
          } catch (e) {
            // fallback to localStorage for now
            try {
              const user = getStoredUser() || JSON.parse(localStorage.getItem('uc_user') || '{}');
              const supervisorRequest = {
                id: Date.now(),
                projectId: createdProjectId,
                projectCreatorId: creatorId,
                projectTitle: projectData.title,
                projectDescription: projectData.description,
                projectField: projectData.field,
                supervisorName: projectData.supervisorName || 'Supervisor',
                supervisorId: projectData.supervisorId,
                studentId: user.studentId || user.id || Date.now(),
                studentName: user.name || user.email || 'Anonymous',
                studentEmail: user.email,
                status: 'pending',
                createdAt: new Date().toISOString()
              };
              const existingRequests = JSON.parse(localStorage.getItem('supervisorRequests') || '[]');
              existingRequests.push(supervisorRequest);
              localStorage.setItem('supervisorRequests', JSON.stringify(existingRequests));
            } catch (_) {
              // ignore
            }
          }
        }

        await loadProjects();
        setShowCreateModal(false);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Failed to create project';
        alert(`❌ ${msg}`);
      }
    })();
  };

  const handleJoinClick = (project) => {
    console.log('✅ Join button clicked for:', project.title);
    setJoinProjectData(project);
    setShowJoinModal(true);
    setSelectedRole('');
    setJoinMessage('');
  };

  const handleSubmitJoinRequest = () => {
    if (!selectedRole.trim()) {
      alert('⚠️ Please select a role');
      return;
    }

    const user = getStoredUser() || JSON.parse(localStorage.getItem('uc_user') || '{}');
    const localRequest = {
      id: Date.now(),
      projectId: joinProjectData.id,
      projectCreatorId: joinProjectData.creatorId,
      projectTitle: joinProjectData.title,
      projectOwner: joinProjectData.supervisor?.name || 'Project Owner',
      requesterId: user.id || Date.now(),
      requesterName: user.name || user.email || 'Anonymous',
      requesterRole: user.role || 'student',
      desiredRole: selectedRole,
      message: joinMessage,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    (async () => {
      try {
        await createJoinRequest({
          projectId: joinProjectData.id,
          desiredRole: selectedRole,
          message: joinMessage
        });
        alert('✅ Join request sent successfully!');
      } catch (e) {
        // Fallback to localStorage if backend not available
        try {
          const existingRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
          existingRequests.push(localRequest);
          localStorage.setItem('joinRequests', JSON.stringify(existingRequests));
          alert('✅ Join request saved locally (backend unavailable).');
        } catch (err) {
          console.error('❌ Failed to save request:', err);
          alert(e?.response?.data?.message || e?.message || '❌ Failed to send request');
          return;
        }
      }

      setShowJoinModal(false);
      setSelectedRole('');
      setJoinMessage('');
      setJoinProjectData(null);
    })();
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

      {isLoading ? (
        <div className="container" style={{ padding: '12px 0' }}>
          Loading projects…
        </div>
      ) : null}

      {loadError ? (
        <div className="container" style={{ padding: '12px 0', color: 'var(--text-color)' }}>
          {loadError}
        </div>
      ) : null}

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
                <button 
                  className="btn join-btn"
                  onClick={() => handleJoinClick(project)}
                >
                  <FaUserPlus /> Join Request
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

      {/* Join Request Modal */}
      {showJoinModal && joinProjectData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '95%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{margin: '0 0 10px 0', color: '#2d3748'}}>
              🚀 Request to Join Project
            </h2>
            <p style={{color: '#718096', marginBottom: '20px', margin: '10px 0 20px 0'}}>
              <strong>{joinProjectData.title}</strong>
            </p>
            
            <div style={{marginBottom: '25px'}}>
              <label style={{display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#2d3748'}}>
                ⭐ Select Your Desired Role:
              </label>
              {['Developer', 'Designer', 'Data Analyst', 'Project Manager', 'QA Tester'].map((role) => (
                <div key={role} style={{marginBottom: '12px'}}>
                  <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', borderRadius: '5px', transition: 'background 0.2s'}}>
                    <input
                      type="radio"
                      name="jobrole"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => {
                        console.log('✅ Role Changed To:', e.target.value);
                        setSelectedRole(e.target.value);
                      }}
                      style={{marginRight: '12px', width: '20px', height: '20px', cursor: 'pointer'}}
                    />
                    <span style={{fontSize: '16px', color: selectedRole === role ? '#667eea' : '#2d3748', fontWeight: selectedRole === role ? 'bold' : 'normal'}}>
                      {role}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{marginBottom: '25px'}}>
              <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2d3748'}}>
                📝 Message (Optional):
              </label>
              <textarea
                value={joinMessage}
                onChange={(e) => {
                  console.log('📝 Message Changed');
                  setJoinMessage(e.target.value);
                }}
                placeholder="Tell the project owner why you'd like to join..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                onClick={() => {
                  console.log('❌ CANCEL CLICKED');
                  setShowJoinModal(false);
                  setSelectedRole('');
                  setJoinMessage('');
                  setJoinProjectData(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#718096',
                  transition: 'all 0.3s'
                }}
              >
                ❌ Cancel
              </button>
              <button
                onClick={() => {
                  console.log('✅ SUBMIT CLICKED! Role:', selectedRole);
                  handleSubmitJoinRequest();
                }}
                disabled={!selectedRole}
                style={{
                  padding: '12px 24px',
                  background: selectedRole ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedRole ? 'pointer' : 'not-allowed',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                ✅ Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProjects;