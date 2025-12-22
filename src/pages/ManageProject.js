// ManageProject.js
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Form,
  Button,
  Table,
  ListGroup,
  InputGroup
} from 'react-bootstrap';
import { Star, StarFill, Github, Download, ArrowLeft, Upload, Calendar } from 'react-bootstrap-icons';

const ManageProject = () => {
  // Dummy project data - in real app, this would come from props or API
  const [project, setProject] = useState({
    id: 1,
    title: "AI Learning Assistant",
    status: "In Progress",
    description: "An AI-powered tool that provides personalized learning recommendations and study plans for students.",
    field: "AI",
    supervisor: "Dr. Somaya",
    teamMembers: [
      { id: 1, name: "Alice Johnson", role: "Frontend Developer", tasks: ["UI Design", "React Components"] },
      { id: 2, name: "Bob Smith", role: "ML Engineer", tasks: ["Model Training", "NLP Processing"] },
      { id: 3, name: "Carol Davis", role: "Backend Developer", tasks: ["API Development", "Database Design"] }
    ],
    progress: 65,
    rating: 4.5,
    skills: ["Python", "TensorFlow", "NLP", "Machine Learning"],
    documentation: "project_documentation.pdf",
    githubUrl: "https://github.com/username/ai-learning-assistant",
    lastUpdated: "2025-01-15",
    milestones: [
      { id: 1, name: "Idea & Planning", status: "completed", date: "2024-09-01" },
      { id: 2, name: "Design Phase", status: "completed", date: "2024-10-15" },
      { id: 3, name: "Implementation", status: "in-progress", date: "2024-11-30" },
      { id: 4, name: "Testing", status: "pending", date: "2025-01-15" },
      { id: 5, name: "Deployment", status: "pending", date: "2025-02-28" }
    ],
    // feedback array holds messages; supervisor messages have sender: 'supervisor'
    feedback: [
      {
        id: 1,
        sender: 'supervisor',
        text: 'Great progress on the ML model. Please focus on improving the recommendation algorithm accuracy.',
        date: '2025-01-10'
      }
    ]
  });

  const [githubInput, setGithubInput] = useState(project.githubUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // In real app, you would upload to server here
    }
  };

  const handleGithubSubmit = (e) => {
    e.preventDefault();
    // Validate URL
    const urlPattern = /^(https?:\/\/)?(www\.)?github\.com\/.+/;
    if (urlPattern.test(githubInput)) {
      setProject(prev => ({ ...prev, githubUrl: githubInput }));
    } else {
      alert("Please enter a valid GitHub URL");
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'primary';
      case 'planning': return 'secondary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  // Allow changing the overall project status
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setProject(prev => ({ ...prev, status: value }));
  };

  // Toggle milestone between completed and pending
  const toggleMilestone = (id) => {
    setProject(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, status: m.status === 'completed' ? 'pending' : 'completed' } : m)
    }));
  };

  const addMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newMilestoneName.trim(),
      status: 'pending',
      date: ''
    };
    setProject(prev => ({ ...prev, milestones: [...prev.milestones, newItem] }));
    setNewMilestoneName('');
  };

  // Note: milestone deletion removed from UI by design; keep items only add/toggle

  // Feedback handling (students reply to supervisor)
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: 'student',
      text: feedbackInput.trim(),
      date: new Date().toLocaleDateString()
    };
    setProject(prev => ({ ...prev, feedback: [...prev.feedback, newMessage] }));
    setFeedbackInput('');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFill key={i} className="text-warning" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarFill key="half" className="text-warning" style={{ opacity: 0.5 }} />);
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-muted" />);
    }

    return stars;
  };

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-primary" className="me-3" onClick={() => window.history.back()}>
          <ArrowLeft className="me-2" />
          Back to My Projects
        </Button>
        <div>
          <h1 className="h2 mb-1">{project.title}</h1>
          <div className="d-flex align-items-center">
            <Badge bg={getStatusVariant(project.status)} className="me-2">
              {project.status}
            </Badge>
            <small className="text-muted">
              <Calendar className="me-1" size={12} />
              Last updated: {project.lastUpdated}
            </small>
          </div>
        </div>
      </div>

      <Row>
        {/* Left Column - Project Details */}
        <Col lg={8}>
          {/* Project Description Card */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Project Description</Card.Title>
              <Card.Text>{project.description}</Card.Text>
            </Card.Body>
          </Card>

          {/* Details Card */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Project Details</Card.Title>
              <Row>
                <Col md={6}>
                  <strong>Field:</strong> {project.field}
                </Col>
                <Col md={6}>
                  <strong>Supervisor:</strong> {project.supervisor}
                </Col>
              </Row>
              <hr />
              <Row className="align-items-center">
                <Col md={6}>
                  <strong>Progress:</strong>
                  <ProgressBar 
                    now={project.progress} 
                    label={`${project.progress}%`}
                    className="mt-2"
                    variant={project.progress >= 80 ? 'success' : project.progress >= 50 ? 'primary' : 'warning'}
                  />
                </Col>
                <Col md={6}>
                  <strong>Rating:</strong>
                  <div className="d-flex align-items-center mt-1">
                    {renderStars(project.rating)}
                    <span className="ms-2">({project.rating})</span>
                  </div>
                </Col>
              </Row>
              <hr />
              <div>
                <strong>Skills & Technologies:</strong>
                <div className="mt-2">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Timeline Section (Todo-style) */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Project Timeline (Todo List)</Card.Title>
              <Form onSubmit={addMilestone} className="mb-3 d-flex">
                <Form.Control
                  placeholder="Add new timeline item"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                />
                <Button type="submit" variant="outline-primary" className="ms-2">Add</Button>
              </Form>

              <ListGroup variant="flush">
                {project.milestones.map((milestone) => (
                  <ListGroup.Item key={milestone.id} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      checked={milestone.status === 'completed'}
                      onChange={() => toggleMilestone(milestone.id)}
                      className="me-3"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{milestone.name}</strong>
                          {milestone.date && <div className="text-muted small">Due: {milestone.date}</div>}
                        </div>
                        <div>
                          <Badge bg={getStatusVariant(milestone.status)} className="me-2">{milestone.status}</Badge>
                          <Button size="sm" variant="outline-danger" onClick={() => deleteMilestone(milestone.id)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Role Distribution Section */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Team Roles & Tasks</Card.Title>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Role</th>
                    <th>Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {project.teamMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                               style={{ width: '32px', height: '32px' }}>
                            <span className="text-white small fw-bold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td>{member.role}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {member.tasks.map((task, index) => (
                            <li key={index} className="small">{task}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Resources & Notes */}
        <Col lg={4}>
          {/* Documentation & Resources */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Documentation & Resources</Card.Title>
              
              {/* File Upload */}
              <Form.Group className="mb-3">
                <Form.Label>Upload Documentation</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type="file" 
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline-primary">
                    <Upload />
                  </Button>
                </InputGroup>
              </Form.Group>

              {/* Current Documentation */}
              {project.documentation && (
                <div className="mb-3">
                  <strong>Current Documentation:</strong>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small">{project.documentation}</span>
                    <Button variant="outline-success" size="sm">
                      <Download className="me-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* GitHub Repository */}
              <Form onSubmit={handleGithubSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>GitHub Repository</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="url"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                    <Button variant="outline-dark" type="submit">
                      <Github />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Form>

              {project.githubUrl && (
                <div className="mt-2">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="small">
                    <Github className="me-1" />
                    View Repository
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Supervisor Feedback (show supervisor messages and allow student replies) */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Supervisor Feedback</Card.Title>

              {/* Show only supervisor messages here (students can reply below) */}
              <div className="mb-3">
                {project.feedback.filter(f => f.sender === 'supervisor').map(msg => (
                  <div key={msg.id} className="bg-light p-3 rounded mb-2">
                    <div className="small text-muted">{msg.date} — <strong>{project.supervisor}</strong></div>
                    <div className="mt-1">{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Reply thread showing student's replies */}
              <div className="mb-3">
                <h6 className="small">Your Replies</h6>
                {project.feedback.filter(f => f.sender === 'student').length === 0 && (
                  <div className="text-muted small">No replies yet. Use the box below to reply to your supervisor.</div>
                )}
                {project.feedback.filter(f => f.sender === 'student').map(msg => (
                  <div key={msg.id} className="p-2 mt-2" style={{ borderLeft: '3px solid #007bff' }}>
                    <div className="small text-muted">{msg.date} — You</div>
                    <div className="mt-1">{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Feedback Reply Form */}
              <Form onSubmit={handleFeedbackSubmit}>
                <Form.Group>
                  <Form.Label className="small">Reply to Supervisor</Form.Label>
                  <Form.Control as="textarea" rows={3} value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Write your reply..." />
                </Form.Group>
                <Button variant="primary" size="sm" className="mt-2" type="submit">Send Reply</Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Team Members */}
          <Card>
            <Card.Body>
              <Card.Title>Team Members ({project.teamMembers.length})</Card.Title>
              <ListGroup variant="flush">
                {project.teamMembers.map(member => (
                  <ListGroup.Item key={member.id} className="px-0">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="text-white fw-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="fw-bold">{member.name}</div>
                        <small className="text-muted">{member.role}</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ManageProject;