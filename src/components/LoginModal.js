import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, tokenStorage } from '../api/client';
import { resolveActorIdForUser } from '../api/actors';

const LoginModal = ({ onClose, onLogin, onSwitchToSignup, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/api/user/login', {
        email: formData.email,
        password: formData.password
      });

      const payload = res?.data?.data;
      const apiUser = payload?.user;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;

      if (!apiUser || !accessToken || !refreshToken) {
        throw new Error('Invalid login response');
      }

      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);

      const userObj = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        type: apiUser.role,
        role: apiUser.role,
        university: apiUser.university
      };

      // Best-effort: resolve student/supervisor table id for later API calls (projects, etc.)
      try {
        const actor = await resolveActorIdForUser(userObj);
        Object.assign(userObj, actor);
      } catch (e) {
        // Ignore if student/supervisor record doesn't exist yet.
      }

      try {
        localStorage.setItem('uc_user', JSON.stringify(userObj));
      } catch (e) {}

      if (typeof onLogin === 'function') onLogin(userObj);
      if (typeof onClose === 'function') onClose();

      if (userObj.type === 'student') navigate('/student');
      if (userObj.type === 'supervisor') navigate('/supervisor');
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Login failed';

      if (status === 403 && err?.response?.data?.needsVerification) {
        setError('Please verify your email before logging in.');
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

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      // Default behavior if no handler provided
      alert(`Password reset link would be sent to: ${formData.email || 'your email'}`);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Login to UniCollab</h2>
        {error ? (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '12px' }}>
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginEmail">Email</label>
            <input 
              type="email" 
              id="loginEmail" 
              name="email"
              className="form-control" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input 
              type="password" 
              id="loginPassword" 
              name="password"
              className="form-control" 
              placeholder="Enter your password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="userType">I am a:</label>
            <select 
              id="userType" 
              name="userType"
              className="form-control"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
          
          {/* Forgot Password Link */}
          <div className="form-footer" style={{ textAlign: 'center', marginTop: '15px' }}>
            <a 
              onClick={handleForgotPassword} 
              style={{ 
                cursor: 'pointer', 
                color: '#007bff', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Forgot your password?
            </a>
          </div>

          <div className="form-footer">
            <p>Don't have an account? <a onClick={onSwitchToSignup}>Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;