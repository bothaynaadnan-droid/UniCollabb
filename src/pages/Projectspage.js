import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import AllProjects from '../components/projects/AllProjects';
import ProjectIdeas from '../components/projects/ProjectIdeas';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState('all-projects');
  const navigate = useNavigate();

  return (
    <div className="projects-page">
      <div className="container">
        {/* Back Button */}
        <button 
          className="back-to-dashboard-btn"
          onClick={() => navigate('/student')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="page-header">
          <h1>Projects Hub</h1>
          <p> Find ideas, and collaborate with teammates</p>
        </div>

        {/* Tab Navigation */}
        <div className="projects-tabs">
          <button 
            className={`tab-button ${activeTab === 'all-projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-projects')}
          >
            All Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 'project-ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('project-ideas')}
          >
            Project Ideas
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'all-projects' && <AllProjects />}
          {activeTab === 'project-ideas' && <ProjectIdeas />}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;