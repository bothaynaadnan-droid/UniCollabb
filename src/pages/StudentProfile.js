import React, { useState, useEffect } from 'react';
import { useTheme } from '../Context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getStudentByUserId } from '../api/actors';
import { getStoredUser, storeUser } from '../api/session';
import { buildProjectRequirements, parseProjectRequirements } from '../api/projects';
import { listJoinRequestInbox, updateJoinRequestStatus } from '../api/joinRequests';
import { getPlannerBucket, savePlannerBucket } from '../api/planner';
import { 
  FaProjectDiagram, FaPlus, FaUsers, FaEnvelope, FaUserTie, 
  FaChartLine, FaComment, FaCalendarAlt, FaStickyNote, FaCog,
  FaEdit, FaTimes, FaStar, FaArrowLeft, FaCheck, FaBell
} from 'react-icons/fa';
import '../styles/StudentProfile.css';

const StudentProfile = ({ user, onLogout, onUpdateUser = () => {} }) => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(user?.profilePic || '');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false); // New state for settings sidebar
  const [joinRequests, setJoinRequests] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const { currentThemeConfig } = useTheme();

  // Load join requests from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('joinRequests') || '[]');
      setJoinRequests(stored);
    } catch (e) {
      console.error('Failed to load join requests:', e);
    }
  }, []);

  // Character options
  const characterOptions = [
    { id: 1, emoji: '👾', category: 'male' },
    { id: 2, emoji: '🌸', category: 'female' },
    { id: 3, emoji: '👨‍🎓', category: 'male' },
    { id: 4, emoji: '👩‍🎓', category: 'female' },
    { id: 5, emoji: '🧑‍💻', category: 'male' },
    { id: 6, emoji: '👩‍💻', category: 'female' },
    { id: 7, emoji: '🤖', category: 'male' },
    { id: 8, emoji: '🥷', category: 'female' }
  ];

  const [projects, setProjects] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Research phase completion", dueDate: "2024-12-15", completed: false },
    { id: 2, title: "Submit progress report", dueDate: "2024-12-20", completed: false },
    { id: 3, title: "Team meeting with supervisor", dueDate: "2024-12-18", completed: true }
  ]);

  const draftsLoadedRef = React.useRef(false);
  const tasksLoadedRef = React.useRef(false);
  const draftsSaveTimerRef = React.useRef(null);
  const tasksSaveTimerRef = React.useRef(null);

  const DRAFTS_LS_KEY = 'planner_drafts';
  const TASKS_LS_KEY = 'planner_tasks';

  const safeParseLocal = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  };

  const scheduleSave = (timerRef, fn) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, 600);
  };

  // Load drafts/tasks from API (fallback to localStorage) once
  useEffect(() => {
    let cancelled = false;

    const loadPlanner = async () => {
      // drafts
      try {
        const apiDrafts = await getPlannerBucket('drafts');
        if (!cancelled && Array.isArray(apiDrafts)) {
          setDrafts(apiDrafts);
        }
      } catch (_) {
        if (!cancelled) {
          const localDrafts = safeParseLocal(DRAFTS_LS_KEY, []);
          if (Array.isArray(localDrafts)) setDrafts(localDrafts);
        }
      } finally {
        draftsLoadedRef.current = true;
      }

      // tasks
      try {
        const apiTasks = await getPlannerBucket('tasks');
        if (!cancelled && Array.isArray(apiTasks)) {
          setTasks(apiTasks);
        }
      } catch (_) {
        if (!cancelled) {
          const localTasks = safeParseLocal(TASKS_LS_KEY, null);
          if (Array.isArray(localTasks)) setTasks(localTasks);
        }
      } finally {
        tasksLoadedRef.current = true;
      }
    };

    loadPlanner();
    return () => {
      cancelled = true;
      if (draftsSaveTimerRef.current) clearTimeout(draftsSaveTimerRef.current);
      if (tasksSaveTimerRef.current) clearTimeout(tasksSaveTimerRef.current);
    };
    // eslint-disable-next-line
  }, [user?.id]);

  const statusToLabel = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'in-progress') return 'In Progress';
    if (s === 'planning') return 'Planning';
    if (s === 'pending') return 'Pending';
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    if (s === 'completed') return 'Completed';
    if (s === 'cancelled') return 'Cancelled';
    return status ? String(status) : 'Planning';
  };

  const labelToStatus = (label) => {
    const s = String(label || '').toLowerCase();
    if (s.includes('in progress')) return 'in-progress';
    if (s.includes('planning')) return 'planning';
    if (s.includes('pending')) return 'pending';
    if (s.includes('approved')) return 'approved';
    if (s.includes('rejected')) return 'rejected';
    if (s.includes('completed')) return 'completed';
    if (s.includes('cancelled')) return 'cancelled';
    return 'planning';
  };

  const mapApiProjectToStudentCard = (p) => {
    const req = parseProjectRequirements(p?.requirements) || {};
    const field = req.field || p?.field || 'Other';
    const skills = Array.isArray(req.requiredSkills) ? req.requiredSkills : [];

    return {
      id: p?.id,
      title: p?.title || '',
      status: statusToLabel(p?.status),
      rating: 0,
      teamMembers: 1,
      supervisor: p?.supervisor_name || req.supervisorName || 'Not assigned',
      progress: 0,
      description: p?.description || '',
      skills,
      field,
      // keep a couple of backend fields for updates
      _apiStatus: p?.status,
      _visibility: p?.visibility
    };
  };

  const loadStudentData = async () => {
    if (!user?.id) return;
    setProjectsLoading(true);
    setProjectsError('');

    try {
      // 1) Refresh profile from backend (ensures we have latest university/name)
      const profileRes = await api.get('/api/user/profile');
      const safe = profileRes?.data?.data;
      if (safe) {
        const mergedUser = { ...user, ...safe };
        storeUser(mergedUser);
        onUpdateUser(mergedUser);
      }

      // 2) Resolve student table id
      let effectiveUser = getStoredUser() || user;
      if (!effectiveUser?.studentId && effectiveUser?.role === 'student') {
        try {
          const student = await getStudentByUserId(effectiveUser.id);
          if (student?.id) {
            effectiveUser = { ...effectiveUser, studentId: student.id };
            storeUser(effectiveUser);
            onUpdateUser(effectiveUser);
          }
        } catch (e) {
          // If student record doesn't exist, projects will be empty.
        }
      }

      const studentId = effectiveUser?.studentId;
      if (!studentId) {
        setProjects([]);
        setProjectsError('Student profile not found in database for this account.');
        return;
      }

      // 2.5) Load join requests inbox for projects created by this student (best-effort)
      try {
        const inbox = await listJoinRequestInbox();
        const mapped = (inbox || []).map(r => ({
          id: r.id,
          projectId: r.project_id,
          projectTitle: r.project_title,
          projectOwner: user?.name || 'Project Owner',
          requesterId: r.requester_user_id,
          requesterName: r.requester_name || 'Student',
          requesterRole: 'student',
          desiredRole: r.desired_role || 'member',
          message: r.message || '',
          status: r.status || 'pending',
          createdAt: r.created_at || new Date().toISOString(),
          _source: 'api'
        }));

        // Merge with any locally-stored requests (offline mode)
        let local = [];
        try {
          local = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        } catch (_) {
          local = [];
        }

        const mergedByKey = new Map();
        for (const item of [...mapped, ...(Array.isArray(local) ? local : [])]) {
          const key = item?._source === 'api' ? `api:${item.id}` : `local:${item.id}`;
          mergedByKey.set(key, item);
        }
        setJoinRequests(Array.from(mergedByKey.values()));
      } catch (e) {
        // Keep whatever localStorage gave us
      }

      // 3) Load projects where student is a member
      const memberRes = await api.get(`/api/project-member/student/${studentId}/projects`);
      const memberProjects = memberRes?.data?.data || [];

      // 4) Also load projects created by the student (in case creator isn't in members)
      const createdRes = await api.get(`/api/project/creator/${studentId}`);
      const createdProjects = createdRes?.data?.data || [];

      const byId = new Map();
      for (const p of [...memberProjects, ...createdProjects]) {
        if (!p?.id) continue;
        byId.set(p.id, mapApiProjectToStudentCard(p));
      }

      setProjects(Array.from(byId.values()));
    } catch (e) {
      setProjects([]);
      setProjectsError(e?.response?.data?.message || e?.message || 'Failed to load student data');
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadStudentData();
    // eslint-disable-next-line
  }, [user?.id]);

  // Persist drafts (best-effort) after initial load
  useEffect(() => {
    if (!draftsLoadedRef.current) return;
    try {
      localStorage.setItem(DRAFTS_LS_KEY, JSON.stringify(drafts || []));
    } catch (_) {
      // ignore
    }

    scheduleSave(draftsSaveTimerRef, async () => {
      try {
        await savePlannerBucket('drafts', drafts || []);
      } catch (_) {
        // keep localStorage fallback
      }
    });
    // eslint-disable-next-line
  }, [drafts]);

  // Persist tasks (best-effort) after initial load
  useEffect(() => {
    if (!tasksLoadedRef.current) return;
    try {
      localStorage.setItem(TASKS_LS_KEY, JSON.stringify(tasks || []));
    } catch (_) {
      // ignore
    }

    scheduleSave(tasksSaveTimerRef, async () => {
      try {
        await savePlannerBucket('tasks', tasks || []);
      } catch (_) {
        // keep localStorage fallback
      }
    });
    // eslint-disable-next-line
  }, [tasks]);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character.emoji);
    setIsEditing(false);
  };

  const renderDraftsView = () => {
    return (
      <div className="my-projects-view">
        <div className="container">
          <button 
            className="back-to-dashboard-btn"
            onClick={() => setCurrentView('dashboard')}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className="page-header">
            <h1>Draft Projects</h1>
            <p>Your saved drafts — move them back to projects when ready.</p>
          </div>

          <div className="projects-detailed-grid">
            {drafts.length === 0 ? (
              <div className="container"><p>No drafts yet.</p></div>
            ) : (
              drafts.map(project => (
                <div key={project.id} className="project-detailed-card clickable">
                  <div className="project-header">
                    <h3 className="project-title">{project.title}</h3>
                    <span className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                    <div className="project-action-icons">
                      <button className="icon-btn edit-btn" title="Edit Draft" onClick={() => { setEditProject(project); setEditProjectForm({...project}); setEditProjectSource('drafts'); setShowEditModal(true); }}>
                        <FaEdit />
                      </button>
                      <button className="icon-btn delete-btn" title="Delete Draft" onClick={() => {
                        if (!window.confirm('Delete this draft?')) return;
                        setDrafts(prev => prev.filter(p => p.id !== project.id));
                      }}>
                        <FaTimes />
                      </button>
                      <button className="icon-btn draft-btn" title="Restore to Projects" onClick={() => restoreDraft(project)}>
                        <FaArrowLeft />
                      </button>
                    </div>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-details">
                    <div className="detail-item"><span className="label">Field:</span><span className="value">{project.field}</span></div>
                    <div className="detail-item"><span className="label">Supervisor:</span><span className="value">{project.supervisor}</span></div>
                    <div className="detail-item"><span className="label">Skills:</span><div className="skills-list">{(project.skills||[]).map(s => <span key={s} className="skill-tag">{s}</span>)}</div></div>
                  </div>
                  <div className="project-actions">
                    <button className="btn manage-btn" onClick={() => { navigate(`/manage-project/${project.id}`); }}>Manage Project</button>
                    <button className="btn view-btn" onClick={() => restoreDraft(project)}>Restore</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Fixed dashboard options with proper navigation
  const dashboardOptions = [
    {
      id: 1,
      title: 'My Projects',
      icon: <FaProjectDiagram />,
      description: 'View and manage your ongoing projects',
      onClick: () => setCurrentView('my-projects')
    },
    {
      id: 2,
      title: 'Create Project',
      icon: <FaPlus />,
      description: 'Start a new project and share your idea',
      onClick: () => navigate('/projectspage') // Navigate to ProjectsPage
    },
    {
      id: 3,
      title: 'Find Team',
      icon: <FaUsers />,
      description: 'Find team members for your projects',
      onClick: () => navigate('/projectspage?tab=find-team') // Navigate to ProjectsPage with find-team tab
    },
    
    {
      id: 4,
      title: 'Supervisors',
      icon: <FaUserTie />,
      description: 'Connect with academic supervisors',
      onClick: () => navigate('/supervisors')
    },
    {
      id: 5,
      title: 'Drafts',
      icon: <FaStickyNote />,
      description: 'View your draft projects',
      onClick: () => setCurrentView('drafts')
    }
  ];

  // Theme Settings Component
  const ThemeSettings = () => {
    const {
      isDarkMode,
      currentTheme,
      themes,
      toggleDarkMode,
      changeTheme
    } = useTheme();

    return (
      <div className="theme-settings-tab">
        <h3>Theme Settings</h3>
        <div className="setting-item">
          <label className="setting-label">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={toggleDarkMode} 
              className="setting-checkbox"
            />
            <span className="setting-text">Dark Mode</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">Select Theme Color:</label>
          <select 
            value={currentTheme} 
            onChange={(e) => changeTheme(e.target.value)}
            className="theme-select"
          >
            {Object.keys(themes).map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>
  
      </div>
    );
  };

  // Settings Sidebar Component
  const SettingsSidebar = () => {
    return (
      <div className={`settings-sidebar ${showSettings ? 'active' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setShowSettings(false)}></div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3><FaCog /> Settings</h3>
            <button 
              className="close-sidebar"
              onClick={() => setShowSettings(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="sidebar-body">
            <ThemeSettings />
            
            <div className="setting-group">
              <h4>Account Settings</h4>
              <div className="setting-item">
                <button className="setting-btn" onClick={() => { setShowEditProfileModal(true); setShowSettings(false); }}>
                  <FaEdit /> Edit Profile & Avatar
                </button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Notification Preferences</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Privacy Settings</button>
              </div>

            </div>
          </div>
        </div>
      </div>      
    );
  };

  // Simple click handlers for tabs
  const handleChatClick = (chatId) => {
    console.log(`Opening chat: ${chatId}`);
    navigate('/chat');
  };

  const handleMissionClick = (missionId) => {
    console.log(`Opening mission: ${missionId}`);
    navigate('/notes-calendar');
  };

  const handleTodoClick = (todoId) => {
    console.log(`Opening todo: ${todoId}`);
    navigate('/notes-calendar');
  };

  const handleProjectClick = (projectId) => {
    console.log(`Opening project: ${projectId}`);
    if (projectId) navigate(`/projects/${projectId}`);
  };

  // Handle accepting join request
  const handleAcceptJoinRequest = async (request) => {
    try {
      if (request?._source === 'api') {
        await updateJoinRequestStatus(request.id, 'accepted');
        setJoinRequests(prev => prev.map(r => (r.id === request.id && r._source === 'api') ? { ...r, status: 'accepted' } : r));
        alert(`✅ You accepted ${request.requesterName}'s join request for "${request.projectTitle}"`);
        return;
      }

      // Resolve the requester's student id from their user id, then add to project members
      const requesterUserId = request?.requesterId;
      const projectId = request?.projectId;
      if (!requesterUserId || !projectId) throw new Error('Invalid request payload');

      const requesterStudentRes = await api.get(`/api/student/user/${requesterUserId}`);
      const requesterStudent = requesterStudentRes?.data?.data;
      if (!requesterStudent?.id) throw new Error('Requester has no student profile');

      const desired = String(request?.desiredRole || '').toLowerCase();
      const role = desired.includes('lead') ? 'leader' : 'member';

      await api.post('/api/project-member', {
        project_id: projectId,
        student_id: requesterStudent.id,
        role
      });

      // Best-effort: update UI member count
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.teamMembers += 1;
        setProjects([...projects]);
      }

      // Update request status in localStorage
      const updated = joinRequests.map(r =>
        r.id === request.id ? { ...r, status: 'accepted' } : r
      );
      setJoinRequests(updated);
      localStorage.setItem('joinRequests', JSON.stringify(updated));

      alert(`✅ You accepted ${request.requesterName}'s join request for "${request.projectTitle}"`);
    } catch (e) {
      console.error('Error accepting request:', e);
      alert(e?.response?.data?.message || e?.message || '❌ Failed to accept request');
    }
  };

  // Handle rejecting join request
  const handleRejectJoinRequest = (request) => {
    try {
      if (request?._source === 'api') {
        (async () => {
          try {
            await updateJoinRequestStatus(request.id, 'rejected');
            setJoinRequests(prev => prev.map(r => (r.id === request.id && r._source === 'api') ? { ...r, status: 'rejected' } : r));
            alert(`❌ You rejected ${request.requesterName}'s join request for "${request.projectTitle}"`);
          } catch (e) {
            alert(e?.response?.data?.message || e?.message || '❌ Failed to reject request');
          }
        })();
        return;
      }

      const updated = joinRequests.map(r => 
        r.id === request.id ? { ...r, status: 'rejected' } : r
      );
      setJoinRequests(updated);
      localStorage.setItem('joinRequests', JSON.stringify(updated));
      
      alert(`❌ You rejected ${request.requesterName}'s join request for "${request.projectTitle}"`);
    } catch (e) {
      console.error('Error rejecting request:', e);
      alert('❌ Failed to reject request');
    }
  };

  // Tab content renderer (removed settings from here)
  const renderTabContent = () => {
    switch (activeTab) {
      // Add other tab cases here if needed
      default:
        return null;
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i}
        className={i < Math.floor(rating) ? 'star filled' : 'star'}
      />
    ));
  };

  // My Projects View
  const renderMyProjectsView = () => {
    console.log('Rendering My Projects View');
    console.log('Projects:', projects);
    console.log('Join Requests:', joinRequests);
    return (
      <div className="my-projects-view">
        <div className="container">
          {/* Back Button */}
          <button 
            className="back-to-dashboard-btn"
            onClick={() => setCurrentView('dashboard')}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="page-header">
            <h1>My Current Projects</h1>
            <p>Manage and track your ongoing projects</p>
          </div>

          {/* Pending Join Requests Section */}
          {joinRequests.length > 0 && (
            <div className="join-requests-section" style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px',
              maxWidth: '100%'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBell style={{ color: '#3498db' }} />
                Pending Join Requests ({joinRequests.filter(r => r.status === 'pending').length})
              </h3>
              
              {joinRequests.filter(r => r.status === 'pending').length > 0 ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {joinRequests.filter(r => r.status === 'pending').map(request => (
                    <div 
                      key={request.id}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                          📋 <strong>{request.projectTitle}</strong>
                        </p>
                        <p style={{ margin: '0 0 6px 0', color: '#555', fontSize: '13px' }}>
                          👤 <strong>{request.requesterName}</strong> ({request.requesterRole}) requested to join as <strong>{request.desiredRole}</strong>
                        </p>
                        {request.message && (
                          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px', fontStyle: 'italic', paddingLeft: '10px', borderLeft: '3px solid #3498db' }}>
                            "{request.message}"
                          </p>
                        )}
                        <p style={{ margin: '6px 0 0 0', color: '#999', fontSize: '11px' }}>
                          📅 {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleAcceptJoinRequest(request)}
                          style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.backgroundColor = '#229954'}
                          onMouseLeave={e => e.target.style.backgroundColor = '#27ae60'}
                        >
                          <FaCheck size={12} /> Accept
                        </button>
                        <button
                          onClick={() => handleRejectJoinRequest(request)}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 15px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.backgroundColor = '#c0392b'}
                          onMouseLeave={e => e.target.style.backgroundColor = '#e74c3c'}
                        >
                          <FaTimes size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>No pending join requests at the moment.</p>
              )}
            </div>
          )}

          {/* Projects Grid */}
          <div className="projects-detailed-grid">
            {projectsLoading ? (
              <div className="container"><p>Loading projects…</p></div>
            ) : null}

            {projectsError ? (
              <div className="container"><p>{projectsError}</p></div>
            ) : null}

            {projects.map(project => (
              <div 
                key={project.id} 
                className="project-detailed-card clickable"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  <span className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.status}
                  </span>
                  {/* Action Icons for owned projects */}
                  <div className="project-action-icons">
                    <button
                      className="icon-btn edit-btn"
                      title="Edit Project"
                      onClick={e => {
                        e.stopPropagation();
                        setEditProject(project);
                        setEditProjectForm({ ...project });
                        setEditProjectSource('projects');
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      title="Delete Project"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          setProjects(prev => prev.filter(p => p.id !== project.id));
                        }
                      }}
                    >
                      <FaTimes />
                    </button>
                    <button
                      className="icon-btn draft-btn"
                      title="Move to Drafts"
                      onClick={e => {
                        e.stopPropagation();
                        moveToDraft(project);
                      }}
                    >
                      <FaStickyNote />
                    </button>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-details">
                  <div className="detail-item">
                    <span className="label">Field:</span>
                    <span className="value">{project.field}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Supervisor:</span>
                    <span className="value">{project.supervisor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Skills:</span>
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
                    <span>{project.teamMembers} members</span>
                  </div>
                  <div className="metric">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
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
                  <button 
                    className="btn manage-btn" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      console.log('Navigating to manage project:', project.id);
                      navigate(`/manage-project/${project.id}`);
                    }}
                  >
                    Manage Project
                  </button>
                  
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/projectspage')}
              >
                <FaPlus /> Create New Project
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/projectspage?tab=find-team')}
              >
                <FaUsers /> Find Team Members
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/projectspage')}
              >
                <FaChartLine /> View Progress Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard View
  const renderDashboardView = () => {
    return (
      <>
        {/* Dashboard Options */}
        <div className="dashboard-section">
          <div className="container">
            <div className="section-title">
              <h2>Student Dashboard</h2>
              <p>Welcome back, {user?.name || 'Student'}! Manage your projects and collaborations.</p>
            </div>
            
            <div className="modern-dashboard-grid">
              {dashboardOptions.map((option, index) => (
                <div 
                  key={option.id} 
                  className="modern-dashboard-card" 
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick();
                  }}
                  style={{
                    '--card-color': currentThemeConfig.primary,
                    '--card-accent': currentThemeConfig.accent,
                    '--card-secondary': currentThemeConfig.secondary,
                    '--animation-order': index
                  }}
                >
                  <div className="card-glow-effect"></div>
                  <div className="card-background-pattern"></div>
                  
                  <div className="card-header">
                    <div 
                      className="card-icon-wrapper"
                      style={{ 
                        backgroundColor: `${currentThemeConfig.primary}20`,
                        border: `2px solid ${currentThemeConfig.primary}40`
                      }}
                    >
                      {React.cloneElement(option.icon, { 
                        style: { color: currentThemeConfig.primary }
                      })}
                    </div>
                    <div className="card-badge">New</div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{option.title}</h3>
                    <p className="card-description">{option.description}</p>
                  </div>
                  
                  <div className="card-footer">
                    <button 
                      className="modern-card-btn"
                      style={{ 
                        backgroundColor: currentThemeConfig.primary,
                        color: 'white'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        option.onClick();
                      }}
                    >
                      <span>Explore</span>
                      <div className="btn-arrow">→</div>
                    </button>
                  </div>
                  
                  <div className="card-hover-effect"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="tab-content-area">
          <div className="container">
            {renderTabContent()}
          </div>
        </div>
      </>
    );
  };

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState(null);
  const [editProjectSource, setEditProjectSource] = useState('projects'); // 'projects' or 'drafts'
  // Edit Profile modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    bio: user?.bio || '',
    characterId: user?.characterId || null,
    skills: Array.isArray(user?.skills) ? [...user.skills] : []
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleProfileFieldChange = (field, value) => {
    setEditProfileForm(prev => ({ ...prev, [field]: value }));
  };

  // Skills are managed at account creation and are read-only here.

  const saveProfileChanges = () => {
    (async () => {
      try {
        const payload = {
          name: editProfileForm?.name,
          email: editProfileForm?.email,
          university: editProfileForm?.university
        };

        const res = await api.put('/api/user/profile', payload);
        const safe = res?.data?.data;
        const updatedUser = { ...user, ...safe, ...editProfileForm };
        storeUser(updatedUser);
        onUpdateUser(updatedUser);
        setShowEditProfileModal(false);
      } catch (err) {
        console.error('Failed to save profile', err);
        alert(err?.response?.data?.message || err?.message || 'Could not save profile changes.');
      }
    })();
  };

  // --- Edit Project form handlers ---
  const handleEditProjectFieldChange = (field, value) => {
    setEditProjectForm(prev => ({ ...prev, [field]: value }));
  };

  const addSkillToEditProject = (skill) => {
    const v = (skill || '').trim();
    if (!v) return;
    setEditProjectForm(prev => {
      if (!prev) return prev;
      const skills = Array.isArray(prev.skills) ? prev.skills : [];
      if (skills.includes(v)) return prev;
      return { ...prev, skills: [...skills, v] };
    });
  };

  const removeSkillFromEditProject = (skill) => {
    setEditProjectForm(prev => ({ ...prev, skills: (prev?.skills || []).filter(s => s !== skill) }));
  };

  const saveProjectChanges = () => {
    if (!editProjectForm) return;
    (async () => {
      try {
        if (editProjectSource === 'projects') {
          const requirements = buildProjectRequirements({
            field: editProjectForm.field,
            requiredSkills: editProjectForm.skills,
            maxTeamSize: editProjectForm.maxTeamSize,
            lookingForTeam: true,
            supervisorName: editProjectForm.supervisor
          });

          await api.put(`/api/project/${editProjectForm.id}`, {
            title: editProjectForm.title,
            description: editProjectForm.description,
            status: labelToStatus(editProjectForm.status),
            visibility: editProjectForm.projectType === 'private' ? 'private' : (editProjectForm._visibility || 'public'),
            requirements
          });

          await loadStudentData();
        } else {
          setDrafts(prev => prev.map(p => p.id === editProjectForm.id ? { ...editProjectForm } : p));
        }
        setShowEditModal(false);
        setEditProject(null);
        setEditProjectForm(null);
      } catch (err) {
        console.error('Failed to save project', err);
        alert(err?.response?.data?.message || err?.message || 'Could not save project changes.');
      }
    })();
  };

  const deleteProject = (projectId) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;
    (async () => {
      try {
        if (editProjectSource === 'projects') {
          await api.delete(`/api/project/${projectId}`);
          await loadStudentData();
        } else {
          setDrafts(prev => prev.filter(p => p.id !== projectId));
        }
        setShowEditModal(false);
        setEditProject(null);
        setEditProjectForm(null);
      } catch (err) {
        console.error('Failed to delete project', err);
        alert(err?.response?.data?.message || err?.message || 'Could not delete project.');
      }
    })();
  };

  const moveToDraft = (project) => {
    if (!project) return;
    setDrafts(prev => {
      if (prev.find(p => p.id === project.id)) return prev;
      return [...prev, project];
    });
    setProjects(prev => prev.filter(p => p.id !== project.id));
  };

  const restoreDraft = (project) => {
    if (!project) return;
    setProjects(prev => {
      if (prev.find(p => p.id === project.id)) return prev;
      return [...prev, project];
    });
    setDrafts(prev => prev.filter(p => p.id !== project.id));
  };

  const addSkillToProfile = () => {
    const v = (newSkillInput || '').trim();
    if (!v) return;
    setEditProfileForm(prev => {
      if (!Array.isArray(prev.skills)) prev.skills = [];
      if (prev.skills.includes(v)) return prev;
      return { ...prev, skills: [...prev.skills, v] };
    });
    setNewSkillInput('');
  }

  const removeSkillFromProfile = (skill) => {
    setEditProfileForm(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skill) }));
  }

  // Skills are read-only on profile page (set during signup)

  return (
    <div className="student-profile">
      {/* Profile Header with Settings Icon */}
      <div 
        className="profile-header"
        style={{ 
          background: `linear-gradient(135deg, ${currentThemeConfig.primary} 0%, ${currentThemeConfig.primaryDark} 100%)` 
        }}
      >
        <div className="container">
          <div className="profile-main">
            <div className="profile-pic-container">
              <div className="profile-pic-large">
                {selectedCharacter || '👤'}
              </div>
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                <FaEdit /> Change Avatar
              </button>
            </div>
            
            <div className="profile-info">
              <div className="profile-header-top">
                <div className="profile-title">
                  <h1 className="student-name">{user?.name || 'Student Name'}</h1>
                  <p className="student-email">{user?.email || 'student@university.edu'}</p>
                  <p className="student-university">{user?.university || 'University'}</p>
                </div>
                <button 
                  className="settings-header-btn"
                  onClick={() => setShowSettings(true)}
                >
                  <FaCog />
                </button>
              </div>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{projects.length}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {projects.reduce((total, project) => total + project.teamMembers, 0)}
                  </span>
                  <span className="stat-label">Team Members</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {(projects.reduce((total, project) => total + project.rating, 0) / projects.length).toFixed(1)}
                  </span>
                  <span className="stat-label">
                    <FaStar className="star filled" /> Rating
                  </span>
                </div>
              </div>
            </div>

              <div className="profile-skills-section">
                <h4>Skills</h4>
                <div className="skills-list" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                  {(user?.skills || []).length === 0 ? (
                    <span className="no-skills">No skills added yet.</span>
                  ) : (
                    (user?.skills || []).map(s => (
                      <div key={s} className="skill-tag">{s}</div>
                    ))
                  )}
                </div>
                
              </div>
          </div>
        </div>
      </div>

      {/* Character Selection Modal */}
      {isEditing && (
        <div className="character-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Choose Your Avatar</h3>
              <button 
                className="close-modal"
                onClick={() => setIsEditing(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="character-grid">
              {characterOptions.map(character => (
                <div
                  key={character.id}
                  className={`character-option ${
                    selectedCharacter === character.emoji ? 'selected' : ''
                  }`}
                  onClick={() => handleCharacterSelect(character)}
                >
                  <div className="character-emoji">{character.emoji}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="character-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-modal" onClick={() => setShowEditProfileModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={editProfileForm.name} onChange={(e) => handleProfileFieldChange('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" value={editProfileForm.email} onChange={(e) => handleProfileFieldChange('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>University</label>
                <input className="form-control" value={editProfileForm.university} onChange={(e) => handleProfileFieldChange('university', e.target.value)} />
              </div>
              

              <div className="form-group">
                <label>Skills</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                  {(editProfileForm.skills || []).length === 0 ? (
                    <span className="no-skills">No skills added.</span>
                  ) : (
                    (editProfileForm.skills || []).map(s => (
                      <div key={s} className="skill-chip">
                        <span>{s}</span>
                        <button className="remove-skill" onClick={() => removeSkillFromProfile(s)} title="Remove skill">
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="skill-add-row" style={{display:'flex',gap:8,marginTop:6}}>
                  <input
                    className="form-control"
                    placeholder="Add a skill (e.g. JavaScript)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillToProfile(); } }}
                  />
                  <button className="btn btn-primary" onClick={addSkillToProfile}><FaPlus /> Add</button>
                </div>
                <div className="skills-note">You can add or remove skills here. Changes will apply when you save.</div>
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                <button className="btn btn-outline" onClick={() => setShowEditProfileModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveProfileChanges}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      <SettingsSidebar />

      {/* Main Content - Switch between views */}
      {currentView === 'my-projects' ? renderMyProjectsView() : (currentView === 'drafts' ? renderDraftsView() : renderDashboardView())}

      {/* Edit Project Modal (to be implemented) */}
      {showEditModal && editProjectForm && (
        <div className="character-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button 
                className="close-modal"
                onClick={() => { setShowEditModal(false); setEditProjectForm(null); setEditProject(null); }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="edit-project-form">
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={editProjectForm.title || ''} onChange={(e) => handleEditProjectFieldChange('title', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={editProjectForm.description || ''} onChange={(e) => handleEditProjectFieldChange('description', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={editProjectForm.status || ''} onChange={(e) => handleEditProjectFieldChange('status', e.target.value)}>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="form-group">
                <label>Field</label>
                <input className="form-control" value={editProjectForm.field || ''} onChange={(e) => handleEditProjectFieldChange('field', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Supervisor</label>
                <input className="form-control" value={editProjectForm.supervisor || ''} onChange={(e) => handleEditProjectFieldChange('supervisor', e.target.value)} />
              </div>

              <div className="form-row" style={{display:'flex',gap:12}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Team Members</label>
                  <input type="number" min={0} className="form-control" value={editProjectForm.teamMembers || 0} onChange={(e) => handleEditProjectFieldChange('teamMembers', Number(e.target.value))} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Progress (%)</label>
                  <input type="range" min={0} max={100} className="form-control" value={editProjectForm.progress || 0} onChange={(e) => handleEditProjectFieldChange('progress', Number(e.target.value))} />
                  <div style={{textAlign:'right'}}>{editProjectForm.progress || 0}%</div>
                </div>
              </div>

              <div className="form-group">
                <label>Skills</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                  {(editProjectForm.skills || []).length === 0 ? (
                    <span className="no-skills">No skills added.</span>
                  ) : (
                    (editProjectForm.skills || []).map(s => (
                      <div key={s} className="skill-chip">
                        <span>{s}</span>
                        <button className="remove-skill" onClick={() => removeSkillFromEditProject(s)} title="Remove skill"><FaTimes /></button>
                      </div>
                    ))
                  )}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input className="form-control" placeholder="Add skill and press Add" id="edit-project-skill-input" />
                  <button className="btn btn-primary" onClick={() => {
                    const el = document.getElementById('edit-project-skill-input');
                    if (el) { addSkillToEditProject(el.value); el.value = ''; }
                  }}><FaPlus /> Add</button>
                </div>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <button className="btn btn-outline" onClick={() => { setShowEditModal(false); setEditProjectForm(null); setEditProject(null); }}>Cancel</button>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-danger" onClick={() => deleteProject(editProjectForm.id)}>Delete Project</button>
                  <button className="btn btn-primary" onClick={saveProjectChanges}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default StudentProfile;