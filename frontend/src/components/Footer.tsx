import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="20" cy="20" r="6" fill="currentColor"/>
                  <path d="M20 2V8M20 32V38M2 20H8M32 20H38" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-name">EngineCore</span>
                <span className="logo-tagline">ML Diagnostics</span>
              </div>
            </div>
            <p className="footer-description">
              Predictive maintenance powered by machine learning. 
              Analyze turbofan engine health and predict remaining useful life.
            </p>
          </div>

          <div className="footer-links">
            <h4>Navigation</h4>
            <nav>
              <a href="#models">Our Models</a>
              <a href="#about">About Project</a>
              <a href="#help">Help Center</a>
            </nav>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <nav>
              <a href="https://github.com/EroKami-727/engine-care" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <a href="https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/" target="_blank" rel="noopener noreferrer">NASA C-MAPSS Dataset</a>
              <a href="#">API Documentation</a>
            </nav>
          </div>

          <div className="footer-links">
            <h4>Technology</h4>
            <nav>
              <a href="#">React + Vite</a>
              <a href="#">Python FastAPI</a>
              <a href="#">TensorFlow LSTM</a>
              <a href="#">Docker</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} EngineCore. Built for portfolio demonstration.
          </p>
          <div className="footer-meta">
            <span>Zero-Ops Architecture</span>
            <span className="separator">|</span>
            <span>Serverless on Localhost</span>
          </div>
        </div>

        {/* Blueprint decoration */}
        <div className="footer-decoration">
          <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
            <circle cx="100" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
            <circle cx="100" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            <line x1="60" y1="50" x2="140" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
            <line x1="100" y1="10" x2="100" y2="90" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
          </svg>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
