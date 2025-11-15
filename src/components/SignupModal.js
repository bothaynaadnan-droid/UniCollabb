import React, { useState } from 'react';

const SignupModal = ({ onClose, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    userType: 'student'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate signup
    onSignup({
      name: formData.name,
      type: formData.userType,
      email: formData.email,
      university: formData.university
    });
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
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            Create Account
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