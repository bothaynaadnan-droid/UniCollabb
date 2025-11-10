import React, { useState } from 'react';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [projectsToReview, setProjectsToReview] = useState([
    {
      id: 1,
      title: "Mobile Health App",
      student: "Sarah Johnson",
      submitted: "2023-12-10",
      status: "Pending Review"
    },
    {
      id: 2,
      title: "IoT Smart Campus",
      student: "Mike Chen",
      submitted: "2023-12-08",
      status: "Pending Review"
    }
  ]);

  const [supervisedStudents, setSupervisedStudents] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      university: "Tech University",
      projects: 2,
      progress: 85
    },
    {
      id: 2,
      name: "Mike Chen",
      university: "State College",
      projects: 1,
      progress: 60
    }
  ]);

  return (
    <div className="dashboard-preview">
      <div className="container">
        <div className="section-title">
          <h2>Supervisor Dashboard</h2>
          <p>Welcome, {user?.name}! Manage student projects and provide guidance.</p>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3><i className="fas fa-clipboard-check"></i> Projects to Review</h3>
              <ul className="project-list">
                {projectsToReview.map(project => (
                  <li key={project.id}>
                    <div className="project-info">
                      <h4>{project.title}</h4>
                      <p>Student: {project.student}</p>
                      <p>Submitted: {project.submitted}</p>
                    </div>
                    <span className="btn btn-outline" style={{fontSize: '0.8rem'}}>
                      {project.status}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{marginTop: '15px', width: '100%'}}>
                Review All Projects
              </button>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-user-graduate"></i> Supervised Students</h3>
              <ul className="project-list">
                {supervisedStudents.map(student => (
                  <li key={student.id}>
                    <div className="project-info">
                      <h4>{student.name}</h4>
                      <p>University: {student.university}</p>
                      <p>Projects: {student.projects} | Progress: {student.progress}%</p>
                    </div>
                    <div className="rating">
                      <i className="fas fa-chart-line" style={{color: 'var(--success)'}}></i>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-chart-line"></i> Performance Metrics</h3>
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <h4>Overall Student Progress</h4>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `conic-gradient(var(--primary) 0% 75%, var(--gray-light) 75% 100%)`,
                  margin: '20px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary)'
                }}>
                  75%
                </div>
                <p>Average completion rate</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-comments"></i> Recent Feedback</h3>
              <p>3 pending feedback requests</p>
              <div style={{marginTop: '15px'}}>
                <button className="btn btn-outline" style={{width: '100%', marginBottom: '10px'}}>
                  Provide Feedback
                </button>
                <button className="btn btn-outline" style={{width: '100%'}}>
                  Schedule Meetings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;