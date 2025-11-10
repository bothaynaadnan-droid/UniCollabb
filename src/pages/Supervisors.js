import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Modal,
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
import { useNavigate } from 'react-router-dom';
import './Supervisors.css';

const Supervisors = () => {
  const navigate = useNavigate();
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
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
    setSupervisors(supervisorsData);
    setFilteredSupervisors(supervisorsData);
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
    // Navigate to university page (to be implemented)
    alert(`Would navigate to ${university} page`);
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
                      {supervisor.researchInterests.slice(0, 3).map((interest, index) => (
                        <Badge 
                          key={index} 
                          bg="primary" 
                          className="interest-tag gradient-badge"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {supervisor.researchInterests.length > 3 && (
                        <Badge bg="light" text="dark" className="interest-tag">
                          +{supervisor.researchInterests.length - 3} more
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

      {/* FIXED Supervisor Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="xl"
        centered
        className="supervisor-modal modern-modal"
      >
        {selectedSupervisor && (
          <>
            <Modal.Header closeButton className="modal-header-custom gradient-bg">
              <div className="modal-header-content">
                <div className="modal-avatar pulse-animation">
                  {selectedSupervisor.avatar}
                </div>
                <div className="modal-title-section">
                  <h4 className="modal-supervisor-name text-white">{selectedSupervisor.name}</h4>
                  <p className="modal-supervisor-title text-light">{selectedSupervisor.title}</p>
                  <div className="modal-badges">
                    {selectedSupervisor.verified && (
                      <Badge bg="light" text="dark" className="me-2">
                        <ShieldCheck size={12} className="me-1" />
                        Verified Supervisor
                      </Badge>
                    )}
                    <Badge bg="light" text="dark">
                      {selectedSupervisor.availability}
                    </Badge>
                  </div>
                </div>
              </div>
            </Modal.Header>
            
            <Modal.Body className="modal-body-custom p-0">
              <div className="modal-scroll-container">
                <Row className="g-0">
                  <Col lg={6} className="p-4 border-end">
                    {/* University & Contact Info */}
                    <div className="info-section glass-effect mb-4">
                      <h6 className="info-section-title text-primary">
                        <Building className="me-2" />
                        Academic Information
                      </h6>
                      <div className="info-content">
                        <div className="info-item">
                          <strong>University:</strong>
                          <p className="mb-2 text-dark">{selectedSupervisor.university}</p>
                        </div>
                        <div className="info-item">
                          <strong>Department:</strong>
                          <p className="mb-2 text-dark">{selectedSupervisor.department}</p>
                        </div>
                        <div className="contact-details">
                          <div className="contact-item">
                            <Envelope size={14} className="me-2 text-primary" />
                            <span className="text-muted">{selectedSupervisor.email}</span>
                          </div>
                          <div className="contact-item">
                            <Telephone size={14} className="me-2 text-primary" />
                            <span className="text-muted">{selectedSupervisor.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Experience & Stats */}
                    <div className="info-section glass-effect">
                      <h6 className="info-section-title text-primary">
                        <Briefcase className="me-2" />
                        Experience & Expertise
                      </h6>
                      <div className="info-content">
                        <div className="stats-grid">
                          <div className="stat-box gradient-bg-primary">
                            <div className="stat-number">{selectedSupervisor.yearsExperience}</div>
                            <div className="stat-label">Years Experience</div>
                          </div>
                          <div className="stat-box gradient-bg-success">
                            <div className="stat-number">{selectedSupervisor.projectsSupervised}</div>
                            <div className="stat-label">Projects Supervised</div>
                          </div>
                        </div>
                        
                        <div className="expertise-tags mt-3">
                          <strong className="d-block mb-2 text-dark">Areas of Expertise:</strong>
                          {selectedSupervisor.expertise.map((skill, index) => (
                            <Badge 
                              key={index} 
                              bg="primary" 
                              className="expertise-badge gradient-badge"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col lg={6} className="p-4">
                    {/* Bio & Research */}
                    <div className="info-section glass-effect mb-4">
                      <h6 className="info-section-title text-primary">
                        <Person className="me-2" />
                        Bio & Research Focus
                      </h6>
                      <div className="info-content">
                        <p className="bio-text">{selectedSupervisor.bio}</p>
                      </div>
                    </div>

                    {/* Research Interests */}
                    <div className="info-section glass-effect mb-4">
                      <h6 className="info-section-title text-primary">
                        Research Interests
                      </h6>
                      <div className="info-content">
                        <div className="research-tags">
                          {selectedSupervisor.researchInterests.map((interest, index) => (
                            <Badge 
                              key={index} 
                              bg="info" 
                              className="research-badge gradient-badge"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Current Projects */}
                    <div className="info-section glass-effect mb-4">
                      <h6 className="info-section-title text-primary">
                        <Briefcase className="me-2" />
                        Current Projects
                      </h6>
                      <div className="info-content">
                        <div className="projects-list">
                          {selectedSupervisor.currentProjects.map(project => (
                            <div key={project.id} className="project-item modern-project-item">
                              <div className="project-info">
                                <div className="project-header">
                                  <span className="project-name fw-semibold">{project.name}</span>
                                  <Badge 
                                    bg={getStatusVariant(project.status)}
                                    className="project-status"
                                  >
                                    {project.status}
                                  </Badge>
                                </div>
                                <p className="project-description text-muted small mb-2">
                                  {project.description}
                                </p>
                                <div className="project-meta">
                                  <span className="students-count">
                                    <Person size={12} className="me-1" />
                                    {project.students} students
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    {selectedSupervisor.achievements && selectedSupervisor.achievements.length > 0 && (
                      <div className="info-section glass-effect">
                        <h6 className="info-section-title text-primary">
                          <Award className="me-2" />
                          Achievements
                        </h6>
                        <div className="info-content">
                          <ul className="achievements-list">
                            {selectedSupervisor.achievements.map((achievement, index) => (
                              <li key={index} className="achievement-item">
                                <Award size={12} className="me-2 text-warning" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            </Modal.Body>
            
            <Modal.Footer className="modal-footer-custom">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseModal}
                className="modern-btn-outline"
              >
                Close
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  // Navigate to contact page or send message
                  alert(`Would contact ${selectedSupervisor.name}`);
                }}
                className="modern-btn-primary"
              >
                <Envelope className="me-2" />
                Contact Supervisor
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Supervisors;