import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>EcoFinds</h3>
          <p>Your destination for sustainable second-hand shopping. Find unique treasures while reducing waste.</p>
        </div>
        
        
        
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://www.facebook.com/odoo"><i className="fab fa-facebook-f"></i></a>
            <a href="https://x.com/Odoo"><i className="fab fa-twitter"></i></a>
            <a href="https://www.instagram.com/odoo.official/"><i className="fab fa-instagram"></i></a>
            <a href="https://github.com/odoo/odoo"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} EcoFinds. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;