import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const SignupModal = ({ onClose, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    userType: 'student',
    skills: '' // comma-separated skills input
  });

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const role = formData.userType;
      const res = await api.post('/api/user/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        university: formData.university
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || 'Registration failed');
      }

      // Backend requires email verification before login.
      setSuccess('Account created. Please check your email to verify your account, then login.');

      const parsedSkills = (formData.skills || '').split(',').map(s => s.trim()).filter(Boolean);
      const newUser = {
        name: formData.name,
        type: role,
        role,
        email: formData.email,
        university: formData.university,
        skills: parsedSkills
      };

      if (typeof onSignup === 'function') onSignup(newUser);

      // Keep user on same page and encourage login, rather than navigating to dashboards.
      if (typeof onSwitchToLogin === 'function') {
        setTimeout(() => onSwitchToLogin(), 800);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed';
      const errors = err?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length) {
        setError(`${message}: ${errors.join(', ')}`);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Join UniCollab</h2>
        {success ? (
          <div className="alert alert-success" role="alert" style={{ marginBottom: '12px' }}>
            {success}
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '12px' }}>
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signupName">Full Name</label>
            <input 
              type="text" 
              id="signupName" 
              name="name"
              className="form-control" 
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupEmail">Email</label>
            <input 
              type="email" 
              id="signupEmail" 
              name="email"
              className="form-control" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input 
              type="password" 
              id="signupPassword" 
              name="password"
              className="form-control" 
              placeholder="Create a password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupUniversity">University</label>
            <input 
              type="text" 
              id="signupUniversity" 
              name="university"
              className="form-control" 
              placeholder="Enter your university" 
              value={formData.university}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupUserType">I am a:</label>
            <select 
              id="signupUserType" 
              name="userType"
              className="form-control"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="signupSkills">Skills (comma-separated)</label>
            <input
              type="text"
              id="signupSkills"
              name="skills"
              className="form-control"
              placeholder="e.g. Python, React, Machine Learning"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Account'}
          </button>
          <div className="form-footer">
            <p>Already have an account? <a onClick={onSwitchToLogin}>Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;