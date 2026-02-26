import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
        <Link to="/returns">Returns & Refunds</Link>
      </div>
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} Beauty by Viktoria. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
