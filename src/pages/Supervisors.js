import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Badge,
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import { 
  Search, 
  Envelope, 
  Building, 
  Book,
  CheckCircle,
  SortDown,
  Person,
  Briefcase,
  Calendar,
  Award,
  ShieldCheck,
  ChevronRight,
  Star,
  Telephone
} from 'react-bootstrap-icons';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Supervisors.css';
import { listSupervisors } from '../api/supervisors';

const Supervisors = () => {
  const navigate = useNavigate();
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedField, setSelectedField] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Enhanced dummy data with more details
  const supervisorsData = [
    {
      id: 1,
      name: "Dr. Somaya Al-Khatib",
      title: "Associate Professor of AI",
      university: "University of Jordan",
      department: "Computer Science",
      email: "s.khatib@ju.edu.jo",
      phone: "+962 7 1234 5678",
      bio: "Leading researcher in Artificial Intelligence with 12+ years of experience. Passionate about mentoring students and bridging the gap between academic research and real-world applications. Committed to ethical AI development and student success.",
      researchInterests: ["Machine Learning", "Natural Language Processing", "Computer Vision", "AI Ethics", "Deep Learning"],
      projectsSupervised: 12,
      yearsExperience: 12,
      verified: true,
      availability: "Accepting new projects",
      avatar: "👩‍🏫",
      achievements: ["Best Research Paper Award 2023", "AI Innovation Grant Recipient", "Outstanding Mentor Award"],
      expertise: ["Deep Learning", "Neural Networks", "Data Analytics", "Python", "TensorFlow"],
      currentProjects: [
        { id: 1, name: "AI-Powered Learning Assistant", status: "In Progress", students: 3, description: "Developing an intelligent tutoring system" },
        { id: 2, name: "Smart Campus Navigation", status: "Completed", students: 2, description: "AI-based indoor navigation system" },
        { id: 3, name: "Medical Image Analysis", status: "Planning", students: 4, description: "AI for medical diagnostics" }
      ]
    },
    {
      id: 2,
      name: "Dr. Ahmed Malek",
      title: "Professor of Cybersecurity",
      university: "Jordan University of Science and Technology",
      department: "Information Technology",
      email: "a.malek@just.edu.jo",
      phone: "+962 7 8765 4321",
      bio: "Cybersecurity expert with extensive industry experience. Focused on developing secure systems and mentoring the next generation of security professionals. Strong advocate for privacy and digital rights.",
      researchInterests: ["Blockchain Security", "Network Defense", "Cryptography", "Cyber Forensics", "Zero Trust Architecture"],
      projectsSupervised: 8,
      yearsExperience: 15,
      verified: true,
      availability: "Limited availability",
      avatar: "👨‍💻",
      achievements: ["National Cybersecurity Award", "Industry Partnership Leader", "Security Innovation Prize"],
      expertise: ["Network Security", "Encryption", "Security Protocols", "Blockchain", "Penetration Testing"],
      currentProjects: [
        { id: 4, name: "Blockchain Voting System", status: "Planning", students: 2, description: "Secure digital voting platform" },
        { id: 5, name: "Secure E-Government Platform", status: "In Progress", students: 3, description: "Government service security framework" }
      ]
    },
    {
      id: 3,
      name: "Dr. Rania Hassan",
      title: "Assistant Professor of Software Engineering",
      university: "Yarmouk University",
      department: "Software Engineering",
      email: "r.hassan@yu.edu.jo",
      phone: "+962 7 5555 1234",
      bio: "Dedicated to excellence in software engineering education and research. Specializes in agile methodologies and user-centered design. Passionate about creating inclusive learning environments and empowering students.",
      researchInterests: ["Agile Development", "UX/UI Design", "Mobile Applications", "Software Testing", "DevOps"],
      projectsSupervised: 6,
      yearsExperience: 8,
      verified: true,
      availability: "Accepting new projects",
      avatar: "👩‍💼",
      achievements: ["Teaching Excellence Award", "Women in Tech Mentor", "Open Source Contributor Award"],
      expertise: ["Full-Stack Development", "Mobile Apps", "System Design", "React", "Node.js"],
      currentProjects: [
        { id: 6, name: "Mobile Health Monitoring App", status: "In Progress", students: 4, description: "Health tracking mobile application" },
        { id: 7, name: "E-Learning Platform Redesign", status: "Completed", students: 3, description: "Modern learning management system" }
      ]
    },
    {
      id: 4,
      name: "Dr. Omar Ziad",
      title: "Associate Professor of Computer Engineering",
      university: "Princess Sumaya University for Technology",
      department: "Computer Engineering",
      email: "o.ziad@psut.edu.jo",
      phone: "+962 7 9999 8888",
      bio: "Specialized in networking and embedded systems with strong background in IoT and smart city solutions. Collaborates with industry partners on real-world implementation projects and student mentorship.",
      researchInterests: ["Networking", "IoT", "Embedded Systems", "Smart Cities", "Wireless Communication"],
      projectsSupervised: 10,
      yearsExperience: 11,
      verified: true,
      availability: "Accepting new projects",
      avatar: "👨‍🔬",
      achievements: ["Industry Innovation Grant", "Patent Holder", "Research Excellence Award"],
      expertise: ["IoT Systems", "Hardware Design", "Network Architecture", "C++", "Embedded Linux"],
      currentProjects: [
        { id: 8, name: "Smart Campus IoT Network", status: "Implementation", students: 3, description: "Campus-wide IoT infrastructure" },
        { id: 9, name: "Autonomous Robot Navigation", status: "Testing", students: 2, description: "AI-powered robotic navigation" }
      ]
    }
  ];

  // Universities and fields for filters
  const universities = ['All', 'The World Islamic Sciences and Education University','University of Jordan', 'Jordan University of Science and Technology', 
                       'Yarmouk University', 'Princess Sumaya University for Technology', 
                       'Al-Balqa Applied University', 'Hashemite University'];

  const fields = ['All', 'Artificial Intelligence', 'Cybersecurity', 'Software Engineering', 
                 'Data Science', 'Web Development', 'Networking', 'Blockchain', 'IoT'];

  useEffect(() => {
    let isMounted = true;

    const mapApiSupervisorToUi = (s) => {
      const specialization = s?.specialization ? String(s.specialization) : '';
      const department = s?.department ? String(s.department) : 'General';

      const researchInterests = specialization
        ? specialization
            .split(/[,/&]/)
            .map(x => x.trim())
            .filter(Boolean)
        : [department];

      return {
        id: s?.id,
        name: s?.name || 'Supervisor',
        title: specialization ? `Supervisor (${specialization})` : 'Supervisor',
        university: s?.university || 'Unknown University',
        department,
        email: s?.email || '',
        phone: '',
        bio: '',
        researchInterests,
        projectsSupervised: 0,
        yearsExperience: 0,
        verified: true,
        availability: 'Accepting new projects',
        avatar: '👨‍🏫',
        achievements: [],
        expertise: researchInterests,
        currentProjects: []
      };
    };

    async function load() {
      try {
        setLoadError('');
        const apiList = await listSupervisors();
        const mapped = Array.isArray(apiList) ? apiList.map(mapApiSupervisorToUi) : [];
        const dataToUse = mapped.length ? mapped : supervisorsData;
        if (!isMounted) return;
        setSupervisors(dataToUse);
        setFilteredSupervisors(dataToUse);
      } catch (e) {
        console.error('Failed to load supervisors:', e);
        if (!isMounted) return;
        setLoadError(e?.response?.data?.message || e?.message || 'Failed to load supervisors');
        setSupervisors(supervisorsData);
        setFilteredSupervisors(supervisorsData);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    filterAndSortSupervisors();
  }, [searchTerm, selectedUniversity, selectedField, sortBy, supervisors]);

  const filterAndSortSupervisors = () => {
    let filtered = supervisors.filter(supervisor => {
      const matchesSearch = supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supervisor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supervisor.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUniversity = selectedUniversity === 'All' || supervisor.university === selectedUniversity;
      const matchesField = selectedField === 'All' || 
                          supervisor.researchInterests.some(interest => 
                            interest.toLowerCase().includes(selectedField.toLowerCase()));

      return matchesSearch && matchesUniversity && matchesField;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        case 'projects':
          return b.projectsSupervised - a.projectsSupervised;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredSupervisors(filtered);
  };

  const handleSupervisorClick = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSupervisor(null);
  };

  const handleViewUniversity = (university) => {
    // Navigate to university page and pass university name
    navigate('/universities', { state: { selectedUniversity: university } });
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Accepting new projects':
        return 'success';
      case 'Limited availability':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status) => {
    if (!status) return 'light';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'planning':
        return 'warning';
      case 'implementation':
        return 'info';
      case 'testing':
        return 'secondary';
      default:
        return 'light';
    }
  };

  return (
    <Container className="supervisors-page py-4">
      {/* Page Header */}
      <div className="page-header text-center mb-5">
        <div className="header-content">
          <h1 className="display-5 fw-bold gradient-text mb-3">Academic Supervisors</h1>
          <p className="lead text-muted mb-4">
            Connect with experienced mentors from universities across Jordan
          </p>
          <div className="header-stats">
            <Badge bg="primary" className="stat-badge">
              <Person className="me-2" size={16} />
              {supervisors.length} Supervisors
            </Badge>
            <Badge bg="success" className="stat-badge">
              <Building className="me-2" size={16} />
              7 Universities
            </Badge>
            <Badge bg="info" className="stat-badge">
              <Briefcase className="me-2" size={16} />
              58+ Projects
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <Card className="filters-card mb-4 glass-effect">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup className="search-input">
                <InputGroup.Text className="search-icon">
                  <Search className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search supervisors, universities, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-field"
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select 
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="filter-select modern-select"
              >
                {universities.map(university => (
                  <option key={university} value={university}>
                    {university === 'All' ? 'All Universities' : university}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <Form.Select 
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="filter-select modern-select"
              >
                {fields.map(field => (
                  <option key={field} value={field}>
                    {field === 'All' ? 'All Fields' : field}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={1}>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="sort-toggle modern-dropdown">
                  <SortDown size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="sort-menu modern-dropdown-menu">
                  <Dropdown.Item 
                    active={sortBy === 'name'}
                    onClick={() => setSortBy('name')}
                    className="sort-item"
                  >
                    <span className="dropdown-icon">👤</span>
                    By Name
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={sortBy === 'experience'}
                    onClick={() => setSortBy('experience')}
                    className="sort-item"
                  >
                    <span className="dropdown-icon">💼</span>
                    Most Experienced
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={sortBy === 'projects'}
                    onClick={() => setSortBy('projects')}
                    className="sort-item"
                  >
                    <span className="dropdown-icon">📊</span>
                    Most Active
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Results Count */}
      <div className="results-count mb-4">
        <p className="text-muted mb-0">
          Showing <strong className="text-primary">{filteredSupervisors.length}</strong> of {supervisors.length} supervisors
          {selectedUniversity !== 'All' && ` from ${selectedUniversity}`}
          {selectedField !== 'All' && ` in ${selectedField}`}
        </p>
      </div>

      {/* Supervisors Grid */}
      <Row className="g-4">
        {filteredSupervisors.map((supervisor, index) => (
          <Col key={supervisor.id} xl={4} lg={4} md={6} sm={12}>
            <Card 
              className="supervisor-card h-100 modern-card"
              onClick={() => handleSupervisorClick(supervisor)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-gradient-border">
                <Card.Body className="p-4">
                  {/* Header with Avatar and Info */}
                  <div className="card-header mb-4">
                    <div className="avatar-section">
                      <div className="supervisor-avatar pulse-animation">
                        {supervisor.avatar}
                      </div>
                      <div className="verification-badge">
                        {supervisor.verified && (
                          <Badge bg="success" className="verified-badge">
                            <CheckCircle size={12} className="me-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="supervisor-basic-info">
                      <h5 className="supervisor-name mb-1">{supervisor.name}</h5>
                      <p className="supervisor-title text-muted small mb-2">{supervisor.title}</p>
                      
                      <div className="university-info mb-2">
                        <Building size={14} className="me-2 text-primary" />
                        <span className="small">{supervisor.university}</span>
                      </div>
                      
                      <div className="department-info">
                        <Book size={14} className="me-2 text-primary" />
                        <span className="small">{supervisor.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Stats */}
                  <div className="experience-stats mb-3">
                    <div className="stat-item">
                      <Briefcase size={14} className="me-2 text-warning" />
                      <span className="small">{supervisor.yearsExperience} years experience</span>
                    </div>
                    <div className="stat-item">
                      <Person size={14} className="me-2 text-info" />
                      <span className="small">{supervisor.projectsSupervised} projects supervised</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="availability mb-3">
                    <Badge 
                      bg={getAvailabilityColor(supervisor.availability)} 
                      className="availability-badge"
                    >
                      <Calendar size={12} className="me-1" />
                      {supervisor.availability}
                    </Badge>
                  </div>

                  {/* Research Interests */}
                  <div className="research-interests">
                    <h6 className="section-label mb-2">
                      <Star size={14} className="me-2 text-warning" />
                      Research Interests
                    </h6>
                    <div className="interests-tags">
                      {(supervisor.researchInterests || []).slice(0, 3).map((interest, index) => (
                        <Badge 
                          key={index} 
                          bg="primary" 
                          className="interest-tag gradient-badge"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {(supervisor.researchInterests || []).length > 3 && (
                        <Badge bg="light" text="dark" className="interest-tag">
                          +{(supervisor.researchInterests || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="card-footer-custom">
                  <div className="footer-actions">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="action-btn modern-btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUniversity(supervisor.university);
                      }}
                    >
                      <Building className="me-1" size={12} />
                      University
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="action-btn modern-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSupervisorClick(supervisor);
                      }}
                    >
                      <Person className="me-1" size={12} />
                      View Profile
                      <ChevronRight size={12} className="ms-1" />
                    </Button>
                  </div>
                </Card.Footer>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* No Results Message */}
      {filteredSupervisors.length === 0 && (
        <div className="text-center py-5">
          <div className="empty-state">
            <Search size={64} className="text-muted mb-3 empty-icon" />
            <h4 className="mb-3 text-dark">No supervisors found</h4>
            <p className="text-muted mb-4">
              Try adjusting your search criteria or filters to find more results
            </p>
            <Button 
              variant="primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedUniversity('All');
                setSelectedField('All');
              }}
              className="clear-filters-btn modern-btn-primary"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Custom Supervisor Detail Modal */}
      {showModal && selectedSupervisor && (
        <div className="supervisor-modal active">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              <FaTimes />
            </button>
            
            <div className="modal-header">
              <div className="supervisor-avatar">{selectedSupervisor.avatar}</div>
              <div className="modal-title-section">
                <h2>{selectedSupervisor.name}</h2>
                <p className="modal-subtitle">{selectedSupervisor.title}</p>
                <div style={{marginTop:'0.75rem',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  {selectedSupervisor.verified && (
                    <Badge bg="success">✓ Verified Supervisor</Badge>
                  )}
                  <Badge bg="info">{selectedSupervisor.availability}</Badge>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
                <div>
                  <div className="modal-section">
                    <h3>Academic Information</h3>
                    <div style={{background:'#f8f9fa',padding:'1rem',borderRadius:12}}>
                      <p><strong>University:</strong> {selectedSupervisor.university}</p>
                      <p><strong>Department:</strong> {selectedSupervisor.department}</p>
                      <p style={{marginBottom:0}}><strong>Email:</strong> {selectedSupervisor.email}</p>
                      <p style={{marginBottom:0}}><strong>Phone:</strong> {selectedSupervisor.phone}</p>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h3>Experience & Expertise</h3>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                      <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',color:'white',padding:'1.5rem',borderRadius:12,textAlign:'center'}}>
                        <div style={{fontSize:'2rem',fontWeight:700}}>{selectedSupervisor.yearsExperience}</div>
                        <div style={{fontSize:'0.9rem'}}>Years Experience</div>
                      </div>
                      <div style={{background:'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',color:'white',padding:'1.5rem',borderRadius:12,textAlign:'center'}}>
                        <div style={{fontSize:'2rem',fontWeight:700}}>{selectedSupervisor.projectsSupervised}</div>
                        <div style={{fontSize:'0.9rem'}}>Projects Supervised</div>
                      </div>
                    </div>
                    <div>
                      <strong>Areas of Expertise:</strong>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginTop:'0.5rem'}}>
                        {(selectedSupervisor.expertise || []).map((skill, idx) => (
                          <Badge key={idx} bg="primary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="modal-section">
                    <h3>Bio & Research</h3>
                    <p style={{color:'#555',lineHeight:1.6}}>{selectedSupervisor.bio}</p>
                  </div>

                  <div className="modal-section">
                    <h3>Research Interests</h3>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
                      {(selectedSupervisor.researchInterests || []).map((interest, idx) => (
                        <Badge key={idx} bg="info">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Current Projects</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:'1rem'}}>
                  {(selectedSupervisor.currentProjects || []).map(project => (
                    <div key={project.id} style={{background:'#f8f9fa',padding:'1.5rem',borderRadius:12,border:'1px solid #e0e0e0'}}>
                      <h5 style={{marginBottom:'0.5rem'}}>{project.name}</h5>
                      <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:getStatusVariant(project.status) === 'success' ? '#4caf50' : getStatusVariant(project.status) === 'primary' ? '#667eea' : '#ff9800',color:'white',borderRadius:6,fontSize:'0.85rem',marginBottom:'1rem'}}>{project.status || 'Unknown'}</span>
                      <p style={{color:'#666',fontSize:'0.95rem',marginBottom:'1rem'}}>{project.description}</p>
                      <span style={{display:'inline-block',padding:'0.35rem 0.8rem',background:'#e0e0e0',borderRadius:6,fontSize:'0.85rem'}}>{project.students} students</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSupervisor.achievements && selectedSupervisor.achievements.length > 0 && (
                <div className="modal-section">
                  <h3>Achievements</h3>
                  <ul style={{listStyle:'none',padding:0}}>
                    {(selectedSupervisor.achievements || []).map((achievement, idx) => (
                      <li key={idx} style={{padding:'0.5rem 0',borderBottom:'1px solid #eee'}}>
                        🏆 {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  window.location.href = `mailto:${selectedSupervisor.email}?subject=Project Supervision Inquiry - ${selectedSupervisor.name}`;
                }}
              >
                <Envelope className="me-2" />
                Contact Supervisor
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Supervisors;