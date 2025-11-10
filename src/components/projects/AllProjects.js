import React, { useState } from 'react';
import { FaSearch, FaFilter, FaPlus, FaUsers, FaStar, FaClock } from 'react-icons/fa';
import CreateProjectModal from './CreateProjectModal';
import './AllProjects.css';

const AllProjects = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Smart Campus Navigation App',
      description: 'A mobile application to help students navigate the university campus with real-time updates and event notifications.',
      field: 'IT',
      skills: ['React Native', 'Firebase', 'Maps API', 'UI/UX'],
      status: 'in-progress',
      progress: 65,
      teamMembers: 3,
      maxTeamSize: 5,
      lookingForTeam: true,
      rating: 4.5,
      supervisor: 'Dr. Smith',
      createdAt: '2024-10-15',
      isOwner: true
    },
    {
      id: 2,
      title: 'AI-Based Learning Assistant',
      description: 'An AI-powered tool that provides personalized learning recommendations and study plans for students.',
      field: 'AI',
      skills: ['Python', 'TensorFlow', 'NLP', 'Machine Learning'],
      status: 'planning',
      progress: 20,
      teamMembers: 2,
      maxTeamSize: 4,
      lookingForTeam: true,
      rating: 4.2,
      supervisor: 'Dr. Johnson',
      createdAt: '2024-10-20',
      isOwner: false
    },
    {
      id: 3,
      title: 'Sustainable Energy Monitor',
      description: 'IoT device to monitor and optimize energy consumption in campus buildings with real-time analytics.',
      field: 'Engineering',
      skills: ['Arduino', 'IoT', 'Data Analysis', 'Embedded Systems'],
      status: 'planning',
      progress: 10,
      teamMembers: 1,
      maxTeamSize: 3,
      lookingForTeam: true,
      rating: 4.0,
      supervisor: 'Dr. Williams',
      createdAt: '2024-10-25',
      isOwner: false
    }
  ]);

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
                <span className="value">{project.supervisor || 'Not assigned'}</span>
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
              {project.isOwner && (
                <button className="btn manage-btn">
                  Manage Project
                </button>
              )}
              <button className="btn view-btn">
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
    </div>
  );
};

export default AllProjects;