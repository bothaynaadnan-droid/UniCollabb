import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import AllProjects from '../components/projects/AllProjects';
import ProjectIdeas from '../components/projects/ProjectIdeas';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import '../styles/ProjectsPage.css';

const ProjectsPage = () => {
  const [activeTab, setActiveTab] = useState('all-projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);
  const navigate = useNavigate();

  const handleUseIdea = (idea) => {
    setPrefilledData({
      title: idea.title,
      description: idea.description,
      field: idea.category
    });
    setShowCreateModal(true);
  };

  const handleCreateProject = (projectData) => {
    // Handle project creation logic here
    console.log('Creating project:', projectData);
    setShowCreateModal(false);
    setPrefilledData(null);
    // You can add logic to save the project or navigate
  };

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
          {activeTab === 'project-ideas' && <ProjectIdeas onUseIdea={handleUseIdea} />}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => {
            setShowCreateModal(false);
            setPrefilledData(null);
          }}
          onSubmit={handleCreateProject}
          prefilledData={prefilledData}
        />
      )}
    </div>
  );
};

export default ProjectsPage;