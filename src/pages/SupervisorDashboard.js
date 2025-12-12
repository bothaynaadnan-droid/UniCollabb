import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../Context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import { useNavigate } from 'react-router-dom';
import { 
  FaProjectDiagram, FaUsers, FaEnvelope, FaUserTie, 
  FaChartLine, FaComment, FaCalendarAlt, FaStickyNote, FaCog,
  FaEdit, FaTimes, FaStar, FaArrowLeft, FaGraduationCap,
  FaCode, FaGitAlt, FaFileAlt, FaRobot, FaGlobe,
  FaBriefcase, FaPlus, FaTrash
} from 'react-icons/fa';
import './SupervisorDashboard.css';

const SupervisorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(user?.profilePic || '👨‍🏫');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { currentThemeConfig } = useTheme();

  // Theme Settings (same as StudentProfile)
  const ThemeSettings = () => {
    const { isDarkMode, currentTheme, themes, toggleDarkMode, changeTheme } = useTheme();

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

  // Project Details Modal (portal)
  const ProjectDetailsModal = () => {
    if (!showProjectDetailModal || !selectedProject) return null;

    const project = selectedProject;

    const modal = (
      <div className="modal-overlay">
        <div className="modal-content glassmorphism project-details-modal">
          <div className="modal-header">
            <h3>{project.title}</h3>
            <button className="close-modal" onClick={closeProjectDetails}><FaTimes /></button>
          </div>

          <div className="modal-body project-details-body">
            <p className="project-full-description">{project.description}</p>

            <div className="project-meta">
              <div><strong>Start Date:</strong> {project.startDate || 'N/A'}</div>
              <div><strong>Deadline:</strong> {project.deadline || project.completionDate || 'N/A'}</div>
              <div><strong>Status:</strong> <span className={`project-status ${project.status}`}>{project.status}</span></div>
            </div>

            <div className="project-tools-section">
              <strong>Tools & Technologies</strong>
              <div className="tools-list">
                {(project.tools || []).map(tool => (
                  <span key={tool} className="tool-tag">{tool}</span>
                ))}
              </div>
            </div>

            <div className="project-team-section">
              <strong>Team Members</strong>
              <div className="team-members">
                {(project.teamMembers || []).map(m => (
                  <div key={m.id} className="team-member">
                    <span className="member-avatar">{m.avatar}</span>
                    <span className="member-name">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="project-progress-section">
              <strong>Progress</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
              </div>
              <div className="progress-percent">{project.progress || 0}%</div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-outline" onClick={closeProjectDetails}>Close</button>
            <button className="btn btn-primary" onClick={() => { handleGiveFeedback(project); closeProjectDetails(); }}>Give Feedback</button>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(modal, document.body);
  };

  // Settings Sidebar Component (mirror StudentProfile)
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
            
            <div className="setting-group">
              <h4>App Settings</h4>
              <div className="setting-item">
                <button className="setting-btn">Language & Region</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn">Help & Support</button>
              </div>
              <div className="setting-item">
                <button className="setting-btn logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mock supervisor data with experience field
  const [supervisor, setSupervisor] = useState({
    id: 1,
    name: 'Dr. Ahmad i',
    email: 'ahmad55@ju.edu.jo',
    university: 'University of Jordan',
    specialization: 'Artificial Intelligence & Machine Learning',
    department: 'Computer Science',
    bio: 'Senior professor specializing in AI research with over 15 years of experience. Passionate about mentoring students in cutting-edge technology projects.',
    skills: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'Research Methodology', 'Data Science'],
    experience: [
      {
        id: 1,
        position: 'Professor of Computer Science',
        institution: 'University of Jordan',
        duration: '2018 - Present',
        description: 'Teaching advanced AI courses and supervising graduate research projects.'
      },
      {
        id: 2,
        position: 'Senior Research Scientist',
        institution: 'Jordanian AI Research Center',
        duration: '2015 - 2018',
        description: 'Led research teams in machine learning and natural language processing projects.'
      },
      {
        id: 3,
        position: 'Assistant Professor',
        institution: 'Yarmouk University',
        duration: '2010 - 2015',
        description: 'Developed curriculum for computer science programs and supervised undergraduate projects.'
      }
    ],
    profileComplete: true,
    avatar: '👨‍🏫'
  });

  // New experience form state
  const [newExperience, setNewExperience] = useState({
    position: '',
    institution: '',
    duration: '',
    description: ''
  });

  // Mock projects data
  const [projects, setProjects] = useState({
    ongoing: [
      {
        id: 1,
        title: "AI-Powered Learning Analytics",
        description: "Developing an intelligent system to analyze student learning patterns and provide personalized recommendations.",
        tools: ["Python", "TensorFlow", "React", "MongoDB"],
        teamMembers: [
          { id: 1, name: "Sarah Mohammad", avatar: "👩‍🎓" },
          { id: 2, name: "Omar Ahmad", avatar: "👨‍🎓" },
          { id: 3, name: "Lina Hassan", avatar: "👩‍🎓" }
        ],
        progress: 75,
        startDate: "2024-01-15",
        deadline: "2024-06-30",
        status: "in-progress"
      },
      {
        id: 2,
        title: "Blockchain for Academic Credentials",
        description: "Creating a secure blockchain-based system for storing and verifying academic certificates.",
        tools: ["Solidity", "Web3.js", "Node.js", "Ethereum"],
        teamMembers: [
          { id: 4, name: "Khalid Mahmoud", avatar: "👨‍🎓" },
          { id: 5, name: "Rana Yousef", avatar: "👩‍🎓" }
        ],
        progress: 45,
        startDate: "2024-02-01",
        deadline: "2024-08-15",
        status: "in-progress"
      }
    ],
    past: [
      {
        id: 3,
        title: "Smart Campus Navigation",
        description: "Mobile application for indoor navigation using AR and IoT sensors.",
        tools: ["React Native", "ARCore", "IoT", "Firebase"],
        teamMembers: [
          { id: 6, name: "Ali Sami", avatar: "👨‍🎓" },
          { id: 7, name: "Nour Ahmed", avatar: "👩‍🎓" }
        ],
        completionDate: "2023-12-20",
        rating: 4.8,
        githubLink: "https://github.com/wise/smart-campus-nav",
        documentation: "https://docs.wise.edu/smart-campus",
        status: "completed"
      }
    ]
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    supervisedStudents: 15,
    activeProjects: 2,
    completedProjects: 8,
    averageRating: 4.6
  });

  // Feedback form state
  const [feedback, setFeedback] = useState({
    comments: '',
    rating: 0,
    projectId: null
  });

  // Character options for supervisors
  const characterOptions = [
    { id: 1, emoji: '👨‍🏫', category: 'male' },
    { id: 2, emoji: '👩‍🏫', category: 'female' },
    { id: 3, emoji: '🧑‍🏫', category: 'neutral' },
    { id: 4, emoji: '👨‍💼', category: 'male' },
    { id: 5, emoji: '👩‍💼', category: 'female' },
    { id: 6, emoji: '🧑‍💼', category: 'neutral' }
  ];

  // Jordanian universities
  const jordanianUniversities = [
    'University of Jordan',
    'Yarmouk University',
    'Jordan University of Science and Technology',
    'Princess Sumaya University for Technology',
    'Hashemite University',
    'Mutah University',
    'Al-Balqa Applied University',
    'German Jordanian University',
    'Applied Science Private University',
    'Philadelphia University'
  ];

  // Skills options
  const skillsOptions = [
    'React', 'Python', 'Machine Learning', 'AI', 'Cybersecurity',
    'Data Science', 'Blockchain', 'Web Development', 'Mobile Development',
    'Cloud Computing', 'IoT', 'AR/VR', 'Database Design', 'Software Engineering'
  ];

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character.emoji);
    setIsEditing(false);
    setSupervisor(prev => ({ ...prev, avatar: character.emoji }));
  };

  // Dashboard options for supervisors
  const dashboardOptions = [
    {
      id: 1,
      title: 'Ongoing Projects',
      icon: <FaProjectDiagram />,
      description: 'Monitor and manage current student projects',
      onClick: () => setCurrentView('ongoing-projects')
    },
    {
      id: 2,
      title: 'Project History',
      icon: <FaCalendarAlt />,
      description: 'Review completed projects and outcomes',
      onClick: () => setCurrentView('past-projects')
    },
    {
      id: 3,
      title: 'Student Teams',
      icon: <FaUsers />,
      description: 'Manage supervised student teams',
      onClick: () => navigate('/supervisor/teams')
    },
    {
      id: 4,
      title: 'Messages',
      icon: <FaEnvelope />,
      description: 'Communicate with students and teams',
      onClick: () => navigate('/messages')
    },
    {
      id: 5,
      title: 'Analytics',
      icon: <FaChartLine />,
      description: 'View project statistics and insights',
      onClick: () => setCurrentView('analytics')
    },
    {
      id: 6,
      title: 'Feedback Center',
      icon: <FaComment />,
      description: 'Provide feedback and evaluations',
      onClick: () => setCurrentView('feedback')
    }
  ];

  // Experience Management Functions
  const handleAddExperience = () => {
    if (newExperience.position && newExperience.institution) {
      const experience = {
        id: Date.now(),
        ...newExperience
      };
      setSupervisor(prev => ({
        ...prev,
        experience: [experience, ...prev.experience]
      }));
      setNewExperience({
        position: '',
        institution: '',
        duration: '',
        description: ''
      });
      setIsEditingExperience(false);
    }
  };

  const handleDeleteExperience = (id) => {
    setSupervisor(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleUpdateExperience = (id, updatedExperience) => {
    setSupervisor(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, ...updatedExperience } : exp
      )
    }));
  };

  // Open feedback modal
  const handleGiveFeedback = (project) => {
    setSelectedProject(project);
    setFeedback({
      comments: '',
      rating: 0,
      projectId: project.id
    });
    setShowFeedbackModal(true);
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetailModal(true);
  };

  const closeProjectDetails = () => {
    setShowProjectDetailModal(false);
    setSelectedProject(null);
  };

  // Submit feedback
  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedback);
    setShowFeedbackModal(false);
    setSelectedProject(null);
    alert('Feedback submitted successfully!');
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i}
        className={`star ${i < rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={() => interactive && onRate && onRate(i + 1)}
      />
    ));
  };

  // Experience Management Component
  const ExperienceManager = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEdit = (experience) => {
      setEditingId(experience.id);
      setEditForm({ ...experience });
    };

    const handleSaveEdit = (id) => {
      handleUpdateExperience(id, editForm);
      setEditingId(null);
      setEditForm({});
    };

    const handleCancelEdit = () => {
      setEditingId(null);
      setEditForm({});
    };

    return (
      <div className="experience-section">
        <div className="section-header">
          <h3>
            <FaBriefcase /> Professional Experience
          </h3>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditingExperience(true)}
          >
            <FaPlus /> Add Experience
          </button>
        </div>

        <div className="experience-list">
          {supervisor.experience.map(exp => (
            <div key={exp.id} className="experience-item glassmorphism">
              {editingId === exp.id ? (
                <div className="experience-edit-form">
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                    className="modern-input"
                    placeholder="Position Title"
                  />
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={(e) => setEditForm(prev => ({ ...prev, institution: e.target.value }))}
                    className="modern-input"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="modern-input"
                    placeholder="Duration (e.g., 2020 - Present)"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="modern-textarea"
                    placeholder="Description of responsibilities and achievements"
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveEdit(exp.id)}
                    >
                      Save
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="experience-header">
                    <div className="experience-info">
                      <h4 className="experience-position">{exp.position}</h4>
                      <p className="experience-institution">{exp.institution}</p>
                      <span className="experience-duration">{exp.duration}</span>
                    </div>
                    <div className="experience-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(exp)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteExperience(exp.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="experience-description">{exp.description}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {supervisor.experience.length === 0 && (
          <div className="empty-state">
            <FaBriefcase className="empty-icon" />
            <p>No experience added yet. Add your first professional experience.</p>
          </div>
        )}
      </div>
    );
  };

  // Add Experience Modal
  const AddExperienceModal = () => {
    if (!isEditingExperience) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content glassmorphism">
          <div className="modal-header">
            <h3>Add Professional Experience</h3>
            <button 
              className="close-modal"
              onClick={() => setIsEditingExperience(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Position Title</label>
              <input
                type="text"
                value={newExperience.position}
                onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                className="modern-input"
                placeholder="e.g., Professor of Computer Science"
              />
            </div>

            <div className="form-group">
              <label>Institution</label>
              <input
                type="text"
                value={newExperience.institution}
                onChange={(e) => setNewExperience(prev => ({ ...prev, institution: e.target.value }))}
                className="modern-input"
                placeholder="e.g., University of Jordan"
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={newExperience.duration}
                onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                className="modern-input"
                placeholder="e.g., 2018 - Present"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={newExperience.description}
                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                className="modern-textarea"
                placeholder="Describe your responsibilities, achievements, and key contributions..."
                rows="4"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setIsEditingExperience(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddExperience}
              disabled={!newExperience.position || !newExperience.institution}
            >
              Add Experience
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Profile Setup Form Component
  const ProfileSetupForm = () => {
    const [formData, setFormData] = useState({
      name: supervisor.name,
      university: supervisor.university,
      department: supervisor.department,
      specialization: supervisor.specialization,
      email: supervisor.email,
      skills: supervisor.skills,
      bio: supervisor.bio
    });

    const handleSkillToggle = (skill) => {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.includes(skill)
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
      }));
    };

    const handleSave = () => {
      setSupervisor(prev => ({ ...prev, ...formData, profileComplete: true }));
      setIsEditing(false);
    };

    return (
      <div className="profile-setup-modal">
        <div className="modal-content glassmorphism">
          <div className="modal-header">
            <h3>Complete Your Profile</h3>
            <p>Please provide your information to get started</p>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label>University</label>
              <select
                value={formData.university}
                onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                className="modern-select"
              >
                <option value="">Select University</option>
                {jordanianUniversities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="modern-input"
              />
            </div>

            <div className="form-group full-width">
              <label>Skills & Expertise</label>
              <div className="skills-selector">
                {skillsOptions.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`skill-chip ${formData.skills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Bio / About Me</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows="4"
                className="modern-textarea"
                placeholder="Tell us about your research interests, experience, and mentoring philosophy..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Feedback Modal Component
  const FeedbackModal = () => {
    if (!showFeedbackModal) return null;

    return (
      <div className="feedback-modal-overlay">
        <div className="feedback-modal glassmorphism">
          <div className="modal-header">
            <h3>Provide Feedback</h3>
            <p>for {selectedProject?.title}</p>
            <button 
              className="close-modal"
              onClick={() => setShowFeedbackModal(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="feedback-content">
            <div className="rating-section">
              <label>Project Rating</label>
              <div className="stars-rating interactive">
                {renderStars(feedback.rating, true, (rating) => 
                  setFeedback(prev => ({ ...prev, rating }))
                )}
                <span className="rating-text">
                  {feedback.rating > 0 ? `${feedback.rating}/5` : 'Select rating'}
                </span>
              </div>
            </div>

            <div className="comments-section">
              <label>Comments & Suggestions</label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Provide detailed feedback about the project progress, team performance, and areas for improvement..."
                rows="6"
                className="modern-textarea"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowFeedbackModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleFeedbackSubmit}
              disabled={!feedback.rating}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    );
  };

  // AI Assistant Component
  const AIAssistant = () => {
    if (!showAIAssistant) return null;

    const aiSuggestions = [
      "Team appears to be progressing well on the AI project. Consider suggesting additional datasets for training.",
      "Blockchain project deadline is approaching. Recommend scheduling a progress review meeting.",
      "Overall student performance is excellent this semester. Consider nominating outstanding projects for awards."
    ];

    return (
      <div className="ai-assistant-overlay">
        <div className="ai-assistant glassmorphism">
          <div className="ai-header">
            <div className="ai-title">
              <FaRobot className="ai-icon" />
              <h3>AI Project Assistant</h3>
            </div>
            <button 
              className="close-ai"
              onClick={() => setShowAIAssistant(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="ai-content">
            <div className="ai-suggestions">
              <h4>Project Insights & Suggestions</h4>
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="ai-actions">
              <button className="btn btn-outline">
                Generate Detailed Report
              </button>
              <button className="btn btn-primary">
                Schedule Team Meetings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Horizontal Statistics Panel Component
  const StatisticsPanel = () => (
    <div className="statistics-panel-horizontal glassmorphism">
      <h3>Supervision Overview</h3>
      <div className="stats-grid-horizontal">
        <div className="stat-card-horizontal">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{statistics.supervisedStudents}</span>
            <span className="stat-label">Supervised Students</span>
          </div>
        </div>
        
        <div className="stat-card-horizontal">
          <div className="stat-icon">
            <FaProjectDiagram />
          </div>
          <div className="stat-info">
            <span className="stat-number">{statistics.activeProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>
        
        <div className="stat-card-horizontal">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <span className="stat-number">{statistics.completedProjects}</span>
            <span className="stat-label">Completed Projects</span>
          </div>
        </div>
        
        <div className="stat-card-horizontal">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-info">
            <span className="stat-number">{statistics.averageRating}</span>
            <span className="stat-label">Avg. Rating</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Ongoing Projects View
  const renderOngoingProjects = () => (
    <div className="projects-view">
      <div className="container">
        <button 
          className="back-to-dashboard-btn"
          onClick={() => setCurrentView('dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Ongoing Projects</h1>
          <p>Monitor and guide current student projects</p>
        </div>

        <div className="projects-grid">
          {projects.ongoing.map(project => (
            <div key={project.id} className="project-card glassmorphism">
              <div className="project-header">
                <h3 className="project-title">{project.title}</h3>
                <span className={`project-status ${project.status}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-tools">
                <strong>Tools Used:</strong>
                <div className="tools-list">
                  {project.tools.map(tool => (
                    <span key={tool} className="tool-tag">{tool}</span>
                  ))}
                </div>
              </div>

              <div className="team-section">
                <strong>Team Members:</strong>
                <div className="team-members">
                  {project.teamMembers.map(member => (
                    <div key={member.id} className="team-member">
                      <span className="member-avatar">{member.avatar}</span>
                      <span className="member-name">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="project-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="project-actions">
                <button className="btn btn-outline" onClick={() => openProjectDetails(project)}>
                  View Details
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleGiveFeedback(project)}
                >
                  Give Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Past Projects View
  const renderPastProjects = () => (
    <div className="projects-view">
      <div className="container">
        <button 
          className="back-to-dashboard-btn"
          onClick={() => setCurrentView('dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="page-header">
          <h1>Completed Projects</h1>
          <p>Review past projects and their outcomes</p>
        </div>

        <div className="projects-grid">
          {projects.past.map(project => (
            <div key={project.id} className="project-card glassmorphism completed">
              <div className="project-header">
                <h3 className="project-title">{project.title}</h3>
                <div className="project-rating">
                  {renderStars(project.rating)}
                  <span>({project.rating})</span>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-links">
                <a href={project.githubLink} className="project-link" target="_blank" rel="noopener noreferrer">
                  <FaGitAlt /> GitHub
                </a>
                <a href={project.documentation} className="project-link" target="_blank" rel="noopener noreferrer">
                  <FaFileAlt /> Documentation
                </a>
              </div>

              <div className="completion-info">
                Completed on: {new Date(project.completionDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main Dashboard View
  const renderDashboardView = () => (
    <div className="dashboard-content">
      <StatisticsPanel />
      <ExperienceManager />
      
      <div className="dashboard-section">
        <div className="container">
          <div className="section-title">
            <h2>Supervisor Dashboard</h2>
            <p>Welcome back, {supervisor.name}! Manage your supervision activities and student projects.</p>
          </div>
          
          <div className="modern-dashboard-grid">
            {dashboardOptions.map((option, index) => (
              <div 
                key={option.id} 
                className="modern-dashboard-card" 
                onClick={option.onClick}
                style={{
                  '--card-color': currentThemeConfig.primary,
                  '--card-accent': currentThemeConfig.accent,
                  '--animation-order': index
                }}
              >
                <div className="card-glow-effect"></div>
                <div className="card-background-pattern"></div>
                
                <div className="card-header">
                  <div className="card-icon-wrapper">
                    {React.cloneElement(option.icon, { 
                      style: { color: currentThemeConfig.primary }
                    })}
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{option.title}</h3>
                  <p className="card-description">{option.description}</p>
                </div>
                
                <div className="card-footer">
                  <button className="modern-card-btn">
                    <span>Access</span>
                    <div className="btn-arrow">→</div>
                  </button>
                </div>
                
                <div className="card-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="supervisor-dashboard">
      {/* Profile Header */}
      <div 
        className="profile-header supervisor-header"
        style={{ 
          background: `linear-gradient(135deg, ${currentThemeConfig.primary} 0%, #2c5aa0 100%)` 
        }}
      >
        <div className="container">
          <div className="profile-main">
            <div className="profile-pic-container">
              <div className="profile-pic-large supervisor-avatar">
                {supervisor.avatar}
              </div>
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
            
            <div className="profile-info">
              <div className="profile-header-top">
                <div className="profile-title">
                  <h1 className="supervisor-name">{supervisor.name}</h1>
                  <p className="supervisor-email">{supervisor.email}</p>
                  <p className="supervisor-university">
                    <FaGraduationCap /> {supervisor.university}
                  </p>
                  <p className="supervisor-specialization">{supervisor.specialization}</p>
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
                  <span className="stat-number">{statistics.supervisedStudents}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{statistics.activeProjects}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{statistics.averageRating}</span>
                  <span className="stat-label">
                    <FaStar className="star filled" /> Avg Rating
                  </span>
                </div>
              </div>

              {/* Skills Display */}
              <div className="skills-display">
                <strong>Expertise:</strong>
                <div className="skills-list">
                  {supervisor.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Setup Form */}
      {!supervisor.profileComplete && <ProfileSetupForm />}

      {/* Character Selection Modal */}
      {isEditing && (
        <div className="character-modal">
          <div className="modal-content glassmorphism">
            <div className="modal-header">
              <h3>Choose Your Professional Avatar</h3>
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
                    supervisor.avatar === character.emoji ? 'selected' : ''
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

      {/* Add Experience Modal */}
      <AddExperienceModal />

      {/* Main Content with proper spacing */}
      <div className="main-content-with-spacing">
        {currentView === 'ongoing-projects' && renderOngoingProjects()}
        {currentView === 'past-projects' && renderPastProjects()}
        {currentView === 'dashboard' && renderDashboardView()}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal />
      {/* Project Details Modal (portal) */}
      <ProjectDetailsModal />

      {/* AI Assistant */}
      <AIAssistant />

      {/* AI Assistant Floating Button */}
      <button 
        className="ai-assistant-btn"
        onClick={() => setShowAIAssistant(true)}
      >
        <FaRobot />
      </button>

      {/* Language Switcher */}
      <div className="language-switcher">
        <button 
          className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
          onClick={() => setCurrentLanguage('en')}
        >
          EN
        </button>
        <button 
          className={`lang-btn ${currentLanguage === 'ar' ? 'active' : ''}`}
          onClick={() => setCurrentLanguage('ar')}
        >
          AR
        </button>
      </div>

      {/* Footer spacer to avoid content being hidden behind fixed nav */}
      <div className="supervisor-footer-space" />

      {/* Bottom Navigation with proper spacing */}
      <div className="bottom-nav-spacing">
        <BottomNavBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    </div>
  );
};

export default SupervisorDashboard;