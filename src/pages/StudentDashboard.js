import React, { useState } from 'react';

const StudentDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "AI Learning Assistant",
      status: "In Progress",
      rating: 4.5,
      teamMembers: 3,
      supervisor: "Dr. Somaya"
    },
    {
      id: 2,
      title: "Blockchain Voting System",
      status: "Planning",
      rating: 3,
      teamMembers: 2,
      supervisor: "Dr.Malek"
    }
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Research phase completion", dueDate: "2023-12-15", completed: false },
    { id: 2, title: "Submit progress report", dueDate: "2023-12-20", completed: false },
    { id: 3, title: "Team meeting with supervisor", dueDate: "2023-12-18", completed: true }
  ]);

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
    <div className="dashboard-preview">
      <div className="container">
        <div className="section-title">
          <h2>Student Dashboard</h2>
          <p>Welcome back, {user?.name}! Manage your projects and collaborations.</p>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3><i className="fas fa-project-diagram"></i> My Projects</h3>
              <ul className="project-list">
                {projects.map(project => (
                  <li key={project.id}>
                    <div className="project-info">
                      <h4>{project.title}</h4>
                      <p>Status: {project.status} | Team: {project.teamMembers} members</p>
                      <p>Supervisor: {project.supervisor}</p>
                    </div>
                    <div className="rating">
                      {renderStars(project.rating)}
                    </div>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{marginTop: '15px', width: '100%'}}>
                <i className="fas fa-plus"></i> New Project
              </button>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-tasks"></i> Tasks</h3>
              <div style={{marginBottom: '15px'}}>
                <strong>{tasks.filter(t => !t.completed).length} pending tasks</strong>
              </div>
              <ul className="project-list">
                {tasks.map(task => (
                  <li key={task.id}>
                    <div className="project-info">
                      <h4 style={{textDecoration: task.completed ? 'line-through' : 'none'}}>
                        {task.title}
                      </h4>
                      <p>Due: {task.dueDate}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => {
                        setTasks(tasks.map(t => 
                          t.id === task.id ? {...t, completed: !t.completed} : t
                        ));
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-comment-dots"></i> Messages</h3>
              <p>5 unread messages</p>
              <div style={{marginTop: '15px'}}>
                <button className="btn btn-outline" style={{width: '100%'}}>
                  View Messages
                </button>
              </div>
            </div>
            
            <div className="dashboard-card">
              <h3><i className="fas fa-user-friends"></i> Team Collaboration</h3>
              <p>Active team members: 8</p>
              <div style={{marginTop: '15px'}}>
                <button className="btn btn-outline" style={{width: '100%', marginBottom: '10px'}}>
                  Find Team Members
                </button>
                <button className="btn btn-outline" style={{width: '100%'}}>
                  Join a Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;