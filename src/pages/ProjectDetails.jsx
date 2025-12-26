import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaGithub, FaFileAlt, FaArrowLeft, FaCheckCircle, FaUserTie, FaUsers } from 'react-icons/fa';
import '../styles/ProjectsHeader.css';
import { getProjectById, mapApiProjectToUi, parseProjectRequirements } from '../api/projects';
import { getStoredUser } from '../api/session';
import { getMembersByProject } from '../api/projectMembers';
import { createFeedback, listFeedbackByProject, updateFeedback } from '../api/projectFeedback';
import { getSupervisorByUserId } from '../api/actors';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      setIsLoading(true);
      setLoadError('');
      try {
        const apiProject = await getProjectById(id);
        const uiProject = mapApiProjectToUi(apiProject);
        // Enrich a bit from requirements JSON if present
        const req = parseProjectRequirements(apiProject?.requirements);
        if (req?.field && !uiProject.field) uiProject.field = req.field;

        // Enrich supervisor info (if available)
        uiProject.supervisor = {
          ...(uiProject.supervisor || {}),
          name: apiProject?.supervisor_name || uiProject.supervisorName || 'Not assigned',
          university: apiProject?.supervisor_university || uiProject?.supervisor?.university || '',
          department: uiProject?.supervisor?.department || '',
          email: uiProject?.supervisor?.email || ''
        };

        // Load team members + feedback (best-effort)
        try {
          const [membersRes, feedbackRes] = await Promise.all([
            getMembersByProject(id).catch(() => ({ members: [], count: 0 })),
            listFeedbackByProject(id).catch(() => ({ feedbacks: [], averageRating: 0, count: 0 }))
          ]);

          uiProject.team = (membersRes?.members || []).map((m) => ({
            name: m?.student_name || 'Student',
            role: m?.role || 'member',
            contribution: ''
          }));

          uiProject.feedback = (feedbackRes?.feedbacks || []).map((f) => ({
            user: f?.supervisor_name || 'Supervisor',
            rating: Number(f?.rating || 0),
            comment: f?.comments || ''
          }));

          if (typeof feedbackRes?.averageRating === 'number') {
            uiProject.rating = feedbackRes.averageRating;
          }
        } catch (_) {
          // ignore
        }

        if (!cancelled) setProject(uiProject);
      } catch (e) {
        if (!cancelled) {
          setProject(null);
          setLoadError(e?.response?.data?.message || e?.message || 'Failed to load project');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleSubmitFeedback = async () => {
    const text = String(feedbackText || '').trim();
    if (!text) {
      alert('Please write some feedback first.');
      return;
    }

    if (!user || user?.role !== 'supervisor') {
      alert('Only supervisors can submit feedback.');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      let supervisorId = user?.supervisorId;
      if (!supervisorId && user?.id) {
        const sup = await getSupervisorByUserId(user.id);
        supervisorId = sup?.id;
      }

      if (!supervisorId) {
        throw new Error('Supervisor profile not found for this account.');
      }

      const existingList = await listFeedbackByProject(id).catch(() => ({ feedbacks: [] }));
      const existing = (existingList?.feedbacks || []).find((f) => Number(f?.supervisor_id) === Number(supervisorId));

      if (existing?.id) {
        await updateFeedback(existing.id, {
          comments: text,
          rating: existing?.rating ?? null,
          status: existing?.status || 'published'
        });
      } else {
        await createFeedback({
          projectId: id,
          supervisorId,
          comments: text,
          rating: null,
          status: 'published'
        });
      }

      const fresh = await listFeedbackByProject(id).catch(() => null);
      if (fresh) {
        const mapped = (fresh.feedbacks || []).map((f) => ({
          user: f?.supervisor_name || 'Supervisor',
          rating: Number(f?.rating || 0),
          comment: f?.comments || ''
        }));
        setProject((prev) => (prev ? { ...prev, feedback: mapped, rating: fresh.averageRating ?? prev.rating } : prev));
      }

      setFeedbackText('');
      alert('Feedback submitted successfully!');
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (!user) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="error-message">
            <h2>Login Required</h2>
            <p>You must be logged in or signed up to view project details.</p>
            <button className="back-btn" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="projects-header">
            <h1>Loading…</h1>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="error-message">
            <h2>Failed to load project</h2>
            <p>{loadError}</p>
            <Link to="/projects" className="back-btn">
              <FaArrowLeft /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details">
        <div className="container">
          <div className="error-message">
            <h2>Project Not Found</h2>
            <p>The project you're looking for doesn't exist.</p>
            <Link to="/projects" className="back-btn">
              <FaArrowLeft /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="project-details">
      <div className="container">
        {/* Back Button */}
        <Link to="/projects" className="back-btn">
          <FaArrowLeft /> Back to Projects
        </Link>

        {/* Project Header */}
        <div className="project-header-details">
          <div className="project-title-section">
            <h1>{project.title}</h1>
            {renderStars(project.rating)}
          </div>
          <p className="project-subtitle">{project.description}</p>
        </div>

        <div className="details-grid">
          {/* Main Content */}
          <div className="main-content">
            {/* Detailed Description */}
            <section className="detail-section">
              <h2>Project Overview</h2>
              <p>{project.detailedDescription || project.description}</p>
            </section>

            {/* Technologies */}
            <section className="detail-section">
              <h2>Technologies & Tools</h2>
              <div className="tools-grid">
                {(project.tools || []).map((tool, index) => (
                  <div key={index} className="tool-card">
                    {tool}
                  </div>
                ))}
              </div>
            </section>

            {/* Project Links */}
            <section className="detail-section">
              <h2>Project Resources</h2>
              <div className="project-links-details">
                {project.githubLink ? (
                  <a 
                    href={project.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resource-btn github-btn"
                  >
                    <FaGithub /> View on GitHub
                  </a>
                ) : null}
                {project.documentation ? (
                  <a 
                    href={project.documentation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resource-btn docs-btn"
                  >
                    <FaFileAlt /> View Documentation
                  </a>
                ) : null}
              </div>
            </section>

            {/* Project Timeline */}
            <section className="detail-section">
              <h2>Project Timeline</h2>
              <div className="timeline">
                {(project.timeline || []).map((stage, index) => (
                  <div key={index} className={`timeline-item ${stage.completed ? 'completed' : ''}`}>
                    <div className="timeline-marker">
                      {stage.completed && <FaCheckCircle />}
                    </div>
                    <div className="timeline-content">
                      <h4>{stage.phase}</h4>
                      <span className="timeline-duration">{stage.duration}</span>
                      <p>{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Feedback Section */}
            <section className="detail-section">
              <h2>Feedback & Reviews</h2>
              <div className="feedback-list">
                {(project.feedback || []).map((review, index) => (
                  <div key={index} className="feedback-item">
                    <div className="feedback-header">
                      <strong>{review.user}</strong>
                      {renderStars(review.rating)}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
              
              {/* Comment Input (Placeholder) */}
              <div className="comment-input">
                <h4>Add Your Feedback</h4>
                <textarea 
                  placeholder="Share your thoughts about this project..."
                  className="comment-textarea"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button className="submit-comment-btn" onClick={handleSubmitFeedback} disabled={isSubmittingFeedback}>
                  {isSubmittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Supervisor Info */}
            <section className="sidebar-section">
              <h3>
                <FaUserTie className="section-icon" />
                Project Supervisor
              </h3>
              <div className="supervisor-card">
                <h4>{project.supervisor?.name || project.supervisorName || 'Not assigned'}</h4>
                {project.supervisor?.department ? <p>{project.supervisor.department}</p> : null}
                {project.supervisor?.university ? <p className="university">{project.supervisor.university}</p> : null}
                {project.supervisor?.email ? (
                  <a href={`mailto:${project.supervisor.email}`} className="contact-link">
                    {project.supervisor.email}
                  </a>
                ) : null}
              </div>
            </section>

            {/* Team Members */}
            <section className="sidebar-section">
              <h3>
                <FaUsers className="section-icon" />
                Team Members
              </h3>
              <div className="team-list">
                {(project.team || []).map((member, index) => (
                  <div key={index} className="team-member">
                    <h4>{member.name}</h4>
                    <span className="member-role">{member.role}</span>
                    <p className="member-contribution">{member.contribution}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Project Tags */}
            <section className="sidebar-section">
              <h3>Project Tags</h3>
              <div className="tags-container">
                {(project.tags || []).map((tag, index) => (
                  <span key={index} className="project-tag-large">#{tag}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;