import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './Universities.css';
import './Universities-darkmode-fixes.css';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';

const UniversitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedView, setExpandedView] = useState(null); // 'students', 'supervisors', or 'projects'
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [intentProject, setIntentProject] = useState(null);
  const [showLocalLogin, setShowLocalLogin] = useState(false);
  const [showLocalSignup, setShowLocalSignup] = useState(false);

  const isAuthenticated = () => {
    try {
      const raw = localStorage.getItem('uc_user');
      if (!raw) return false;
      try {
        const obj = JSON.parse(raw);
        return !!(obj && (obj.email || obj.name));
      } catch (e) {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const handleAuthSuccess = (user) => {
    // user already stored by Login/Signup modal, but keep local state cleanup
    setShowAuthPrompt(false);
    setShowLocalLogin(false);
    setShowLocalSignup(false);
    // navigate to intended project if exists
    if (intentProject) {
      const p = intentProject;
      if (p.status && (p.status === 'completed' || p.status === 'Completed')) {
        navigate(`/projects/${p.id}`);
      } else {
        navigate(`/projectspage`, { state: { projectId: p.id, activeTab: 'all-projects' } });
      }
      setShowModal(false);
      setExpandedView(null);
      setIntentProject(null);
    }
  };

  useEffect(() => {
    const universitiesData = [
      {
        id: 1,
        name: 'The World Islamic and Sciences Education University',
        shortName: 'WISE University',
        image: 'https://www.wise.edu.jo/%D9%83%D9%84%D9%8A%D8%A9-%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7-%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA/',
        description: 'A leading private university in Jordan focusing on Islamic studies, sciences, and education with state-of-the-art facilities. Known for its innovative approach to combining traditional Islamic education with modern sciences.',
        students: 5,
        supervisors: 3,
        projects: 3,
        colorTheme: 'yellow',
        rating: 4.8,
        location: 'Amman, Jordan',
        founded: 2008
      },
      {
        id: 2,
        name: 'University of Jordan',
        shortName: 'University of Jordan',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/University_of_Jordan_Main_Gate.jpg/1280px-University_of_Jordan_Main_Gate.jpg',
        description: 'The largest and oldest university in Jordan, renowned for its comprehensive academic programs and research excellence. A pioneer in higher education with extensive campus facilities.',
        students: 5,
        supervisors: 3,
        projects: 3,
        colorTheme: 'blue',
        rating: 4.7,
        location: 'Amman, Jordan',
        founded: 1962
      },
      {
        id: 3,
        name: 'Al-Balqa Applied University',
        shortName: 'Al-Balqa Applied University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Al-Balqa%27_Applied_University.jpg/1280px-Al-Balqa%27_Applied_University.jpg',
        description: 'Pioneering applied education in Jordan with strong emphasis on practical skills and industry partnerships. Focuses on technical and vocational education across multiple campuses.',
        students: 0,
        supervisors: 0,
        projects: 0,
        colorTheme: 'green',
        rating: 1,
        location: 'Al-Salt, Jordan',
        founded: 1997
      },
      {
        id: 4,
        name: 'Jordan University of Science and Technology',
        shortName: 'JUST',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Jordan_University_of_Science_and_Technology.jpg/1280px-Jordan_University_of_Science_and_Technology.jpg',
        description: 'Premier institution for scientific and technological education and research in the Middle East. Specializes in engineering, medicine, and applied sciences.',
        students: 0,
        supervisors: 0,
        projects: 0,
        colorTheme: 'teal',
        rating: 1,
        location: 'Irbid, Jordan',
        founded: 1986
      },
      {
        id: 5,
        name: 'Princess Sumaya University for Technology',
        shortName: 'PSUT',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Princess_Sumaya_University_2019.jpg/1280px-Princess_Sumaya_University_2019.jpg',
        description: 'Specialized in IT, engineering, and business with strong industry connections and innovation focus. Known for its modern campus and technology-driven programs.',
        students: 5200,
        supervisors: 320,
        projects: 2800,
        colorTheme: 'purple',
        rating:1,
        location: 'Amman, Jordan',
        founded: 1991
      },
      {
        id: 6,
        name: 'Yarmouk University',
        shortName: 'Yarmouk University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Yarmouk_University_main_gate.jpg/1280px-Yarmouk_University_main_gate.jpg',
        description: 'Comprehensive university known for its diverse academic programs and vibrant campus life. Strong focus on humanities, sciences, and cultural studies.',
        students: 0,
        supervisors: 0,
        projects: 0,
        colorTheme: 'orange',
        rating: 1,
        location: 'Irbid, Jordan',
        founded: 1976
      },
      {
        id: 7,
        name: 'Hashemite University',
        shortName: 'Hashemite University',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hashemite_University_%28Zarqa%29_001.jpg/1280px-Hashemite_University_%28Zarqa%29_001.jpg',
        description: 'Modern university with strong research programs and commitment to community development. Features extensive campus facilities and diverse academic offerings.',
        students: 0,
        supervisors: 0,
        projects: 0,
        colorTheme: 'red',
        rating:1 ,
        location: 'Zarqa, Jordan',
        founded: 1995
      }
    ];

    setUniversities(universitiesData);
  }, []);

  // Check if a university was passed via navigation state and open its modal
  useEffect(() => {
    if (location.state?.selectedUniversity && universities.length > 0) {
      const uni = universities.find(u => u.name === location.state.selectedUniversity);
      if (uni) {
        setSelectedUniversity(uni);
        setShowModal(true);
      }
    }
  }, [location.state, universities]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Dummy data for students, supervisors, and projects per university
  const universityDetails = {
    1: {
      students: [
        { name: 'Alaa Al-Masri', major: 'Computer Science', year: '4th', bio: 'Passionate about AI and machine learning', rating: 4.8 },
        { name: 'Sara Khalil', major: 'Software Engineering', year: '3rd', bio: 'Full-stack developer with startup experience', rating: 4.7 },
        { name: 'Mohammad Qasem', major: 'IT', year: '4th', bio: 'Cybersecurity enthusiast', rating: 4.5 },
        { name: 'Fatima Hassan', major: 'Computer Science', year: '2nd', bio: 'Mobile app development focus', rating: 4.6 },
        { name: 'Ahmed Mansour', major: 'Software Engineering', year: '3rd', bio: 'Cloud computing specialist', rating: 4.9 }
      ],
      supervisors: [
        { name: 'Dr. Fadi Al-Khatib', title: 'Professor', expertise: 'AI, Machine Learning', bio: '15+ years experience in AI research', rating: 4.9 },
        { name: 'Dr. Lina Al-Saleh', title: 'Associate Professor', expertise: 'Web Development, Databases', bio: 'Expert in database design and optimization', rating: 4.7 },
        { name: 'Dr. Hassan Nasser', title: 'Assistant Professor', expertise: 'Cybersecurity', bio: 'Information security specialist', rating: 4.6 }
      ],
      projects: [
        { id: 1, name: 'Smart Campus Navigation App', status: 'in-progress', students: 3, description: 'A mobile application to help students navigate the university campus with real-time updates and event notifications.', tech: ['React Native', 'Firebase', 'Maps API', 'UI/UX'], rating: 4.5 },
        { id: 2, name: 'AI-Based Learning Assistant', status: 'planning', students: 2, description: 'An AI-powered tool that provides personalized learning recommendations and study plans for students.', tech: ['Python', 'TensorFlow', 'NLP', 'Machine Learning'], rating: 4.2 },
        { id: 3, name: 'Sustainable Energy Monitor', status: 'planning', students: 1, description: 'IoT device to monitor and optimize energy consumption in campus buildings with real-time analytics.', tech: ['Arduino', 'IoT', 'Data Analysis', 'Embedded Systems'], rating: 4.0 }
      ],
      studentsAvgRating: 4.7,
      supervisorsAvgRating: 4.7,
      projectsAvgRating: 4.7
    },
    2: {
      students: [
        { name: 'Maya Haddad', major: 'Computer Science', year: '4th', bio: 'AI researcher with publications', rating: 4.9 },
        { name: 'Omar Nasser', major: 'Software Engineering', year: '3rd', bio: 'DevOps and cloud specialist', rating: 4.8 },
        { name: 'Rania Saad', major: 'IT', year: '2nd', bio: 'Backend development focus', rating: 4.6 },
        { name: 'Layla Mansour', major: 'Computer Science', year: '4th', bio: 'Data science enthusiast', rating: 4.7 },
        { name: 'Karim Hassan', major: 'Software Engineering', year: '3rd', bio: 'Game development expert', rating: 4.8 }
      ],
      supervisors: [
        { name: 'Dr. Somaya Al-Khatib', title: 'Professor', expertise: 'AI, NLP', bio: 'Leading researcher in natural language processing', rating: 4.9 },
        { name: 'Dr. Ahmed Malek', title: 'Professor', expertise: 'Cybersecurity, Blockchain', bio: 'Cybersecurity industry veteran', rating: 4.8 },
        { name: 'Dr. Rania Hassan', title: 'Associate Professor', expertise: 'Software Engineering, UX', bio: 'Agile methodologies expert', rating: 4.7 }
      ],
      projects: [
        { id: 3, name: 'AI-Powered Learning Assistant', status: 'In Progress', students: 3, description: 'Intelligent tutoring system', tech: ['Python', 'TensorFlow'], rating: 4.9 },
        { id: 4, name: 'Medical Image Analysis', status: 'Planning', students: 4, description: 'AI for medical diagnostics', tech: ['Deep Learning', 'OpenCV'], rating: 4.7 },
        { id: 12, name: 'Smart Campus System', status: 'In Progress', students: 5, description: 'IoT-based campus management', tech: ['IoT', 'Python'], rating: 4.6 }
      ],
      studentsAvgRating: 4.8,
      supervisorsAvgRating: 4.8,
      projectsAvgRating: 4.7
    },
    // Add similar detailed data for other universities...
  };

  return (
    <div className="universities-page">
      {/* Hero Section */}
      <section className="universities-page__hero-section">
        <div className="universities-page__container">
          <div className="universities-page__hero-content">
            <div className="universities-page__hero-text">
              <h1 className="universities-page__hero-title">
                Connecting Jordan's Academic Excellence
              </h1>
              <p className="universities-page__hero-description">
                UniCollab is revolutionizing how Jordanian universities collaborate. 
                Our platform bridges the gap between students and supervisors across 
                institutions, creating unprecedented opportunities for innovation, 
                research, and academic growth.
              </p>
              <div className="universities-page__hero-highlights">
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🚀</div>
                  <span>Showcase groundbreaking projects</span>
                </div>
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🤝</div>
                  <span>Connect with top supervisors</span>
                </div>
                <div className="universities-page__highlight-item">
                  <div className="universities-page__highlight-icon">🌍</div>
                  <span>Collaborate across universities</span>
                </div>
              </div>
            </div>
            <div className="universities-page__hero-visual">
              <div className="universities-page__floating-cards">
                <div className="universities-page__floating-card universities-page__card-1">🎓</div>
                <div className="universities-page__floating-card universities-page__card-2">🔬</div>
                <div className="universities-page__floating-card universities-page__card-3">💡</div>
                <div className="universities-page__floating-card universities-page__card-4">🏆</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="universities-page__universities-section">
        <div className="universities-page__container">
          <div className="universities-page__section-header">
            <h2 className="universities-page__section-title">
              Explore the Universities Participating in Our Platform
            </h2>
            <p className="universities-page__section-subtitle">
              Discover Jordan's leading academic institutions and their vibrant communities on UniCollab
            </p>
          </div>

          <div className="universities-page__universities-list">
            {universities.map((university, index) => (
              <div 
                key={university.id}
                className={`universities-page__university-item universities-page__${university.colorTheme} ${index % 2 === 1 ? 'universities-page__reverse' : ''}`}
              >
                <div className="universities-page__university-image-container">
                  <img 
                    src={university.image} 
                    alt={`${university.name} campus`}
                    className="universities-page__university-building"
                  />
                  <div className="universities-page__image-overlay"></div>
                  <div className="universities-page__university-rating">
                    <span className="universities-page__rating-star">⭐</span>
                    <span className="universities-page__rating-value">{university.rating}</span>
                  </div>
                  <div className="universities-page__university-badge">
                    #{index + 1} in Participation
                  </div>
                </div>
                
                <div className="universities-page__university-content">
                  <div className="universities-page__university-header">
                    <h3 className="universities-page__university-name">{university.name}</h3>
                    <div className="universities-page__university-meta">
                      <span className="universities-page__location">📍 {university.location}</span>
                      <span className="universities-page__founded">🏛️ Founded {university.founded}</span>
                    </div>
                  </div>
                  
                  <p className="universities-page__university-description">{university.description}</p>
                  
                  <div className="universities-page__university-stats">
                    <button 
                      className="universities-page__stat-item universities-page__stat-button"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setShowModal(true);
                        setExpandedView('students');
                      }}
                    >
                      <div className="universities-page__stat-icon">👨‍🎓</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.students)}</div>
                        <div className="universities-page__stat-label">Active Students</div>
                      </div>
                    </button>
                    <button 
                      className="universities-page__stat-item universities-page__stat-button"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setShowModal(true);
                        setExpandedView('supervisors');
                      }}
                    >
                      <div className="universities-page__stat-icon">👨‍🏫</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.supervisors)}</div>
                        <div className="universities-page__stat-label">Supervisors</div>
                      </div>
                    </button>
                    <button 
                      className="universities-page__stat-item universities-page__stat-button"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setShowModal(true);
                        setExpandedView('projects');
                      }}
                    >
                      <div className="universities-page__stat-icon">📁</div>
                      <div className="universities-page__stat-content">
                        <div className="universities-page__stat-number">{formatNumber(university.projects)}</div>
                        <div className="universities-page__stat-label">Projects</div>
                      </div>
                    </button>
                  </div>
                  
                  <div className="universities-page__university-actions">
                    <button 
                      className="universities-page__view-profile-btn"
                      onClick={() => {
                        setSelectedUniversity(university);
                        setShowModal(true);
                      }}
                    >
                      View University Profile →
                    </button>
                  </div>
                </div>
                
                <div className="universities-page__university-accent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Modal for university details */}
      {showModal && selectedUniversity && !expandedView && (
        <div className="university-modal active">
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{selectedUniversity.name}</h2>
                <p className="modal-subtitle">{selectedUniversity.location}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <h3 style={{margin:0}}>Students Participating</h3>
                  <button style={{background:'#667eea',color:'white',border:'none',padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontSize:'0.9rem',fontWeight:600}} onClick={() => setExpandedView('students')}>More ({(universityDetails[selectedUniversity.id]?.students || []).length})</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
                  {(universityDetails[selectedUniversity.id]?.students || []).slice(0,3).map((student, idx) => (
                    <div key={idx} style={{borderRadius:12,padding:'0.75rem 1.5rem',background:'#e8f4f8',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:'1.5rem'}}>{['🧑‍🎓','👩‍🎓','👨‍🎓'][idx%3]}</span>
                      <span style={{fontWeight:500}}>{typeof student === 'string' ? student : student.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <h3 style={{margin:0}}>Supervisors Participating</h3>
                  <button style={{background:'#667eea',color:'white',border:'none',padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontSize:'0.9rem',fontWeight:600}} onClick={() => setExpandedView('supervisors')}>More ({(universityDetails[selectedUniversity.id]?.supervisors || []).length})</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
                  {(universityDetails[selectedUniversity.id]?.supervisors || []).slice(0,3).map((sup, idx) => (
                    <div key={idx} style={{borderRadius:12,padding:'0.75rem 1.5rem',background:'#eafbe7',display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:'1.5rem'}}>{['👨‍🏫','👩‍🏫','🧑‍🏫'][idx%3]}</span>
                      <span style={{fontWeight:500}}>{typeof sup === 'string' ? sup : sup.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <h3 style={{margin:0}}>Active Projects</h3>
                  <button style={{background:'#667eea',color:'white',border:'none',padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontSize:'0.9rem',fontWeight:600}} onClick={() => setExpandedView('projects')}>More ({(universityDetails[selectedUniversity.id]?.projects || []).length})</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'1.5rem'}}>
                  {(universityDetails[selectedUniversity.id]?.projects || []).slice(0,2).map(project => (
                    <div
                      key={project.id}
                      style={{background:'#f8f9fa',padding:'1.5rem',borderRadius:16,border:'1px solid #e0e0e0'}}
                    >
                      <h5 style={{marginBottom:'0.5rem'}}>{project.name}</h5>
                      <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:'#667eea',color:'white',borderRadius:8,fontSize:'0.85rem',marginBottom:'1rem'}}>{project.status}</span>
                      <p style={{color:'#666',fontSize:'0.95rem',marginBottom:'1rem'}}>{project.description}</p>
                      {project.tech && <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>{project.tech.map((t,i) => <span key={i} style={{display:'inline-block',padding:'0.25rem 0.6rem',background:'#e0e0e0',borderRadius:4,fontSize:'0.8rem'}}>{t}</span>)}</div>}
                      <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:'#e0e0e0',borderRadius:8,fontSize:'0.85rem',marginTop:'0.5rem'}}>{project.students} students</span>
                      <button
                        style={{marginTop:'1rem',background:'#667eea',color:'white',border:'none',padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontWeight:600}}
                        onClick={() => {
                          if (isAuthenticated()) {
                            navigate(`/projects/${project.id}`);
                            setShowModal(false);
                            setExpandedView(null);
                          } else {
                            setIntentProject(project);
                            setShowAuthPrompt(true);
                          }
                        }}
                      >
                        View Project
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auth prompt modal shown when user is not logged in and tries to view a project */}
      {showAuthPrompt && (
        <div className="university-modal active">
          <div className="modal-overlay" onClick={() => setShowAuthPrompt(false)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowAuthPrompt(false)}>
              <FaTimes />
            </button>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>Login Required</h2>
                <p style={{margin:0}}>You must be logged in to view project details.</p>
              </div>
            </div>
            <div className="modal-body">
              <p>Please log in or create an account to continue.</p>
              <div style={{display:'flex',gap:12,marginTop:12}}>
                <button className="btn-primary" onClick={() => { setShowAuthPrompt(false); setShowLocalLogin(true); }}>
                  Login
                </button>
                <button style={{background:'#e2e8f0',border:'none',padding:'0.5rem 1rem',borderRadius:8}} onClick={() => { setShowAuthPrompt(false); setShowLocalSignup(true); }}>
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLocalLogin && (
        <LoginModal
          onClose={() => setShowLocalLogin(false)}
          onLogin={(user) => handleAuthSuccess(user)}
          onSwitchToSignup={() => { setShowLocalLogin(false); setShowLocalSignup(true); }}
        />
      )}
      {showLocalSignup && (
        <SignupModal
          onClose={() => setShowLocalSignup(false)}
          onSignup={(user) => handleAuthSuccess(user)}
          onSwitchToLogin={() => { setShowLocalSignup(false); setShowLocalLogin(true); }}
        />
      )}

      {/* Expanded View for Students */}
      {expandedView === 'students' && showModal && selectedUniversity && (
        <div className="university-modal active">
          <div className="modal-overlay" onClick={() => setExpandedView(null)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setExpandedView(null)}>
              <FaTimes />
            </button>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>All Students - {selectedUniversity.name}</h2>
              </div>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
                {(universityDetails[selectedUniversity.id]?.students || []).map((student, idx) => (
                  <div key={idx} style={{background:'#f8f9fa',padding:'1.5rem',borderRadius:16,border:'1px solid #e0e0e0'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                        <span style={{fontSize:'2.5rem'}}>{['🧑‍🎓','👩‍🎓','👨‍🎓'][idx%3]}</span>
                        <div>
                          <h5 style={{margin:0,marginBottom:'0.25rem'}}>{student.name}</h5>
                          <span style={{color:'#888',fontSize:'0.9rem'}}>{student.year} Year</span>
                        </div>
                      </div>
                      <span style={{fontSize:'1rem',fontWeight:600}}>⭐ {student.rating}/5</span>
                    </div>
                    <p style={{margin:'0.5rem 0',color:'#666'}}><strong>Major:</strong> {student.major}</p>
                    <p style={{margin:0,color:'#555',fontSize:'0.95rem'}}>{student.bio}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setExpandedView(null)}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View for Supervisors */}
      {expandedView === 'supervisors' && showModal && selectedUniversity && (
        <div className="university-modal active">
          <div className="modal-overlay" onClick={() => setExpandedView(null)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setExpandedView(null)}>
              <FaTimes />
            </button>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>All Supervisors - {selectedUniversity.name}</h2>
              </div>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
                {(universityDetails[selectedUniversity.id]?.supervisors || []).map((sup, idx) => (
                  <div key={idx} style={{background:'#f8f9fa',padding:'1.5rem',borderRadius:16,border:'1px solid #e0e0e0'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                        <span style={{fontSize:'2.5rem'}}>{['👨‍🏫','👩‍🏫','🧑‍🏫'][idx%3]}</span>
                        <div>
                          <h5 style={{margin:0,marginBottom:'0.25rem'}}>{sup.name}</h5>
                          <span style={{color:'#888',fontSize:'0.9rem'}}>{sup.title}</span>
                        </div>
                      </div>
                      <span style={{fontSize:'1rem',fontWeight:600}}>⭐ {sup.rating}/5</span>
                    </div>
                    <p style={{margin:'0.5rem 0',color:'#666'}}><strong>Expertise:</strong> {sup.expertise}</p>
                    <p style={{margin:0,color:'#555',fontSize:'0.95rem'}}>{sup.bio}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setExpandedView(null)}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View for Projects */}
      {expandedView === 'projects' && showModal && selectedUniversity && (
        <div className="university-modal active">
          <div className="modal-overlay" onClick={() => setExpandedView(null)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setExpandedView(null)}>
              <FaTimes />
            </button>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>All Projects - {selectedUniversity.name}</h2>
              </div>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1.5rem'}}>
                {(universityDetails[selectedUniversity.id]?.projects || []).map(project => (
                  <div
                    key={project.id}
                    style={{background:'#f8f9fa',padding:'1.5rem',borderRadius:16,border:'1px solid #e0e0e0'}}
                  >
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                      <h5 style={{marginBottom:0,marginTop:0}}>{project.name}</h5>
                      <span style={{fontSize:'1rem',fontWeight:600,whiteSpace:'nowrap',marginLeft:'0.5rem'}}>⭐ {project.rating}/5</span>
                    </div>
                    <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:'#667eea',color:'white',borderRadius:8,fontSize:'0.85rem',marginBottom:'1rem'}}>{project.status}</span>
                    <p style={{color:'#666',fontSize:'0.95rem',marginBottom:'1rem',margin:'0.75rem 0'}}>{project.description}</p>
                    {project.tech && (
                      <div style={{marginBottom:'1rem'}}>
                        <strong style={{fontSize:'0.9rem',color:'#333'}}>Tech Stack:</strong>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.5rem'}}>
                          {project.tech.map((t,i) => <span key={i} style={{display:'inline-block',padding:'0.25rem 0.6rem',background:'#667eea',color:'white',borderRadius:4,fontSize:'0.8rem'}}>{t}</span>)}
                        </div>
                      </div>
                    )}
                    <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:'#e0e0e0',borderRadius:8,fontSize:'0.85rem'}}>{project.students} students</span>
                    <button
                      style={{marginTop:'1rem',background:'#667eea',color:'white',border:'none',padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontWeight:600}}
                      onClick={() => {
                        if (isAuthenticated()) {
                          if (project.status === 'completed' || project.status === 'Completed') {
                            navigate(`/projects/${project.id}`);
                          } else {
                            navigate(`/projectspage`, { state: { projectId: project.id, activeTab: 'all-projects' } });
                          }
                          setShowModal(false);
                          setExpandedView(null);
                        } else {
                          setIntentProject(project);
                          setShowAuthPrompt(true);
                        }
                      }}
                    >
                      View Project
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setExpandedView(null)}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitiesPage;