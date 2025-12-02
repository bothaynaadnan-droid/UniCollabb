import React, { useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import './CreateProjectModal.css';

const CreateProjectModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: 'IT',
    requiredSkills: [],
    currentSkill: '',
    lookingForTeam: true,
    supervisor: '',
    projectType: 'public',
    maxTeamSize: 4
  });

  const fields = ['IT', 'AI', 'Engineering', 'Business', 'Science', 'Design', 'Other'];
  const supervisors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Not assigned'];

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.requiredSkills.includes(formData.currentSkill.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, formData.currentSkill.trim()],
        currentSkill: ''
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-project-modal">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Project Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project in detail..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field">Field *</label>
              <select
                id="field"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              >
                {fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="maxTeamSize">Team Size</label>
              <select
                id="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) })}
              >
                {[2, 3, 4, 5, 6].map(size => (
                  <option key={size} value={size}>{size} members</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills</label>
            <div className="skills-input">
              <input
                type="text"
                value={formData.currentSkill}
                onChange={(e) => setFormData({ ...formData, currentSkill: e.target.value })}
                placeholder="Add required skills"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button type="button" onClick={handleAddSkill} className="add-skill-btn">
                Add
              </button>
            </div>
            <div className="skills-list">
              {formData.requiredSkills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supervisor">Suggested Supervisor</label>
              <select
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              >
                {supervisors.map(supervisor => (
                  <option key={supervisor} value={supervisor}>{supervisor}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="projectType">Project Type</label>
              <select
                id="projectType"
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              >
                <option value="public">Public - Looking for Team</option>
                <option value="private">Private Project</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.lookingForTeam}
                onChange={(e) => setFormData({ ...formData, lookingForTeam: e.target.checked })}
              />
              <span className="checkmark"></span>
              Looking for team members
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;