import React, { useState } from 'react';

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('student');

  const studentProjects = [
    {
      id: 1,
      title: "AI Learning Assistant",
      status: "In Progress",
      rating: 4.5
    },
    {
      id: 2,
      title: "Blockchain Voting System",
      status: "Planning",
      rating: 3
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i 
        key={i}
        className={
          i < Math.floor(rating) 
            ? "fas fa-star" 
            : i < rating 
              ? "fas fa-star-half-alt" 
              : "far fa-star"
        }
      ></i>
    ));
  };

  return (
    <section className="dashboard-preview">
      <div className="container">
        <div className="section-title">
          <h2>Dashboard Previews</h2>
          <p>See how students and supervisors interact with the platform</p>
        </div>
        <div className="dashboard-tabs">
          <div 
            className={`dashboard-tab ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            Student Dashboard
          </div>
          <div 
            className={`dashboard-tab ${activeTab === 'supervisor' ? 'active' : ''}`}
            onClick={() => setActiveTab('supervisor')}
          >
            Supervisor Dashboard
          </div>
        </div>
        <div className="dashboard-content">
          {activeTab === 'student' ? (
            <div id="student-dashboard">
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3><i className="fas fa-project-diagram"></i> My Projects</h3>
                  <ul className="project-list">
                    {studentProjects.map(project => (
                      <li key={project.id}>
                        <div className="project-info">
                          <h4>{project.title}</h4>
                          <p>Status: {project.status}</p>
                        </div>
                        <div className="rating">
                          {renderStars(project.rating)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="dashboard-card">
                  <h3><i className="fas fa-tasks"></i> Tasks</h3>
                  <p>3 tasks pending</p>
                </div>
                <div className="dashboard-card">
                  <h3><i className="fas fa-comment-dots"></i> Messages</h3>
                  <p>5 unread messages</p>
                </div>
              </div>
            </div>
          ) : (
            <div id="supervisor-dashboard">
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3><i className="fas fa-clipboard-check"></i> Projects to Review</h3>
                  <p>7 projects awaiting feedback</p>
                </div>
                <div className="dashboard-card">
                  <h3><i className="fas fa-user-graduate"></i> Supervised Students</h3>
                  <p>12 students under guidance</p>
                </div>
                <div className="dashboard-card">
                  <h3><i className="fas fa-chart-line"></i> Performance Metrics</h3>
                  <p>View student progress reports</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;