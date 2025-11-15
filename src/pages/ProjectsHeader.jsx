import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaFilter, FaSort, FaGithub, FaFileAlt } from 'react-icons/fa';
import './ProjectsHeader.css';

const ProjectsHeader = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterTech, setFilterTech] = useState('all');
  const [visibleProjects, setVisibleProjects] = useState(6);

  // Sample projects data
  const projects = [
    {
      id: 1,
      title: "AI Learning Assistant",
      description: "An intelligent tutoring system that provides personalized learning recommendations using machine learning algorithms.",
      tools: ["Python", "TensorFlow", "React", "MongoDB"],
      rating: 4.8,
      tags: ["AI", "Machine Learning", "Education"],
      githubLink: "https://github.com/example/ai-learning-assistant",
      documentation: "https://docs.example.com/ai-learning-assistant",
      supervisor: {
        name: "Dr. Sarah Johnson",
        university: "Tech University",
        department: "Computer Science"
      },
      team: [
        { name: "Alice Chen", role: "ML Engineer" },
        { name: "Bob Smith", role: "Frontend Developer" },
        { name: "Carol Davis", role: "Backend Developer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Johnson", comment: "Excellent implementation of ML algorithms" },
        { user: "Prof. Wilson", comment: "Great user interface and documentation" }
      ]
    },
    {
      id: 2,
      title: "Blockchain Voting System",
      description: "A secure and transparent voting platform built on blockchain technology for academic elections.",
      tools: ["Solidity", "Web3.js", "Node.js", "React"],
      rating: 4.6,
      tags: ["Blockchain", "Web3", "Security"],
      githubLink: "https://github.com/example/blockchain-voting",
      documentation: "https://docs.example.com/blockchain-voting",
      supervisor: {
        name: "Dr. Michael Brown",
        university: "Blockchain Institute",
        department: "Cybersecurity"
      },
      team: [
        { name: "David Lee", role: "Blockchain Developer" },
        { name: "Emma Wilson", role: "Smart Contract Engineer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Brown", comment: "Innovative approach to secure voting" }
      ]
    },
    {
      id: 3,
      title: "Smart Campus Navigation",
      description: "Mobile app for indoor and outdoor campus navigation with AR features and real-time updates.",
      tools: ["React Native", "ARCore", "Firebase", "Node.js"],
      rating: 4.4,
      tags: ["Mobile", "AR", "Navigation"],
      githubLink: "https://github.com/example/campus-navigation",
      documentation: "https://docs.example.com/campus-navigation",
      supervisor: {
        name: "Dr. Lisa Wang",
        university: "Urban University",
        department: "Software Engineering"
      },
      team: [
        { name: "Frank Martinez", role: "Mobile Developer" },
        { name: "Grace Kim", role: "AR Developer" },
        { name: "Henry Taylor", role: "Backend Developer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Wang", comment: "Excellent AR implementation" }
      ]
    },
    {
      id: 4,
      title: "E-Commerce Analytics Dashboard",
      description: "Real-time analytics dashboard for e-commerce businesses with predictive sales forecasting.",
      tools: ["Vue.js", "D3.js", "Python", "PostgreSQL"],
      rating: 4.7,
      tags: ["Analytics", "Data Visualization", "E-commerce"],
      githubLink: "https://github.com/example/ecommerce-analytics",
      documentation: "https://docs.example.com/ecommerce-analytics",
      supervisor: {
        name: "Dr. Robert Garcia",
        university: "Business Tech College",
        department: "Data Science"
      },
      team: [
        { name: "Ivy Chen", role: "Data Scientist" },
        { name: "Jack Brown", role: "Frontend Developer" },
        { name: "Karen Davis", role: "Backend Developer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Garcia", comment: "Outstanding data visualization work" }
      ]
    },
    {
      id: 5,
      title: "Health Monitoring IoT System",
      description: "IoT-based health monitoring system for elderly patients with real-time alerts and analytics.",
      tools: ["Arduino", "Python", "React", "MQTT"],
      rating: 4.3,
      tags: ["IoT", "Healthcare", "Monitoring"],
      githubLink: "https://github.com/example/health-monitoring",
      documentation: "https://docs.example.com/health-monitoring",
      supervisor: {
        name: "Dr. Patricia Miller",
        university: "Medical Tech University",
        department: "Biomedical Engineering"
      },
      team: [
        { name: "Leo Wilson", role: "IoT Engineer" },
        { name: "Mia Johnson", role: "Data Analyst" },
        { name: "Nathan Lee", role: "Full Stack Developer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Miller", comment: "Great integration of hardware and software" }
      ]
    },
    {
      id: 6,
      title: "Virtual Reality Classroom",
      description: "Immersive VR learning environment for remote education with interactive 3D content.",
      tools: ["Unity", "C#", "WebGL", "Firebase"],
      rating: 4.5,
      tags: ["VR", "Education", "3D"],
      githubLink: "https://github.com/example/vr-classroom",
      documentation: "https://docs.example.com/vr-classroom",
      supervisor: {
        name: "Dr. James Anderson",
        university: "Digital Learning Institute",
        department: "Virtual Reality"
      },
      team: [
        { name: "Olivia Martinez", role: "VR Developer" },
        { name: "Paul Taylor", role: "3D Artist" },
        { name: "Quinn Brown", role: "Backend Developer" }
      ],
      timeline: [
        { phase: "Idea & Planning", completed: true },
        { phase: "Research & Design", completed: true },
        { phase: "Development", completed: true },
        { phase: "Testing", completed: true },
        { phase: "Final Presentation", completed: true }
      ],
      feedback: [
        { user: "Dr. Anderson", comment: "Innovative approach to remote learning" }
      ]
    }
  ];

  // Get all unique technologies for filter
  const allTechnologies = useMemo(() => {
    const techs = new Set();
    projects.forEach(project => {
      project.tools.forEach(tool => techs.add(tool));
    });
    return ['all', ...Array.from(techs)].sort();
  }, []);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.tools.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTech = filterTech === 'all' || project.tools.includes(filterTech);
      return matchesSearch && matchesTech;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterTech]);

  const displayedProjects = filteredAndSortedProjects.slice(0, visibleProjects);

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < Math.floor(rating) ? 'star filled' : 'star'}
          />
        ))}
        <span className="rating-number">({rating})</span>
      </div>
    );
  };

  return (
    <div className="projects-page">
      <div className="container">
        {/* Header */}
        <div className="projects-header">
          <h1>Top Rated Student Projects</h1>
          <p>Discover innovative projects created by students across universities</p>
        </div>

        {/* Search and Filters */}
        <div className="projects-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="filter-select"
              >
                {allTechnologies.map(tech => (
                  <option key={tech} value={tech}>
                    {tech === 'all' ? 'All Technologies' : tech}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <FaSort className="filter-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Count */}
        <div className="projects-count">
          Showing {displayedProjects.length} of {filteredAndSortedProjects.length} projects
        </div>

        {/* Projects List */}
        <div className="projects-list">
          {displayedProjects.map(project => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card-link">
              <div className="project-card">
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  {renderStars(project.rating)}
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-tools">
                  <h4>Technologies Used:</h4>
                  <div className="tools-list">
                    {project.tools.map((tool, index) => (
                      <span key={index} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>

                <div className="project-tags">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="project-tag">#{tag}</span>
                  ))}
                </div>

                <div className="project-links">
                  <a 
                    href={project.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGithub /> GitHub
                  </a>
                  <a 
                    href={project.documentation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaFileAlt /> Documentation
                  </a>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        {visibleProjects < filteredAndSortedProjects.length && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => setVisibleProjects(prev => prev + 6)}
            >
              Load More Projects
            </button>
          </div>
        )}

        {/* No Results Message */}
        {filteredAndSortedProjects.length === 0 && (
          <div className="no-results">
            <h3>No projects found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsHeader;