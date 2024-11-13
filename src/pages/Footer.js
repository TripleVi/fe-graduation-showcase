// Footer.js
import React from 'react';
import '../css/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">About Us</h3>
          <p className="footer-text">Showcasing exceptional projects from various fields and fostering innovation.</p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Follow Us</h3>
          <div className="social-icons">
            <a href="#facebook" className="icon" style={{ backgroundColor: 'var(--faceBook)' }}>F</a>
            <a href="#linkedin" className="icon" style={{ backgroundColor: 'var(--linkedin)' }}>L</a>
            <a href="#github" className="icon" style={{ backgroundColor: 'var(--github)' }}>G</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-text">&copy; 2024 Showcase. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
