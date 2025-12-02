import React, { useState } from 'react';

const LoginModal = ({ onClose, onLogin, onSwitchToSignup, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    const userObj = {
      name: '',
      type: formData.userType,
      email: formData.email
    };
    // persist simple user state so other pages can check login
    try { localStorage.setItem('uc_user', JSON.stringify(userObj)); } catch (e) {}
    onLogin(userObj);
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
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Login
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