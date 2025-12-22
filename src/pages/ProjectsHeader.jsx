import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaSearch, FaFilter, FaSort, FaGithub, FaFileAlt } from 'react-icons/fa';
import '../styles/ProjectsHeader.css';
import projectsData from '../data/projectsData';

const ProjectsHeader = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterTech, setFilterTech] = useState('all');
  const [visibleProjects, setVisibleProjects] = useState(6);

  // Use canonical projects data
  const projects = projectsData;

  // Get all unique technologies for filter
  const allTechnologies = useMemo(() => {
    const techs = new Set();
    projects.forEach(project => {
      project.tools.forEach(tool => techs.add(tool));
    });
    return ['all', ...Array.from(techs)].sort();
  }, [projects]);

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
  }, [searchTerm, sortBy, filterTech, projects]);

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