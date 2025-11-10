import React from 'react';

const footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>UniCollab</h3>
            <p>Connecting students and supervisors across universities for innovative project collaboration.</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Projects</a></li>
              <li><a href="#">Supervisors</a></li>
              <li><a href="#">Universities</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Community Guidelines</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li><a href="#">support@unicollab.edu</a></li>
              <li><a href="#">+1 (555) 123-4567</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          &copy; 2023 UniCollab. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default footer;