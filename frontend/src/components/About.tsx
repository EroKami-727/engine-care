import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-subtitle">The Project</span>
            <h2 className="section-title">About EngineCore</h2>
            
            <p className="about-lead">
              EngineCore is a cutting-edge predictive maintenance platform that leverages 
              machine learning to forecast remaining useful life (RUL) of turbofan engines.
            </p>

            <div className="about-text">
              <p>
                Built on the NASA C-MAPSS (Commercial Modular Aero-Propulsion System Simulation) 
                dataset, our platform uses advanced LSTM neural networks to analyze time-series 
                sensor data and predict engine degradation patterns before catastrophic failures occur.
              </p>
              <p>
                The system implements a "Zero-Ops" architecture with serverless localhost deployment, 
                featuring dynamic container scaling that spins up ML workers on-demand and scales 
                to zero during idle periods—demonstrating modern cloud-native engineering principles.
              </p>
            </div>

            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">21</span>
                <span className="stat-text">Sensor Inputs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">92%</span>
                <span className="stat-text">Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0ms</span>
                <span className="stat-text">Cold Start*</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-text">ML Models</span>
              </div>
            </div>
          </div>

          <div className="about-features">
            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="feature-content">
                <h4>LSTM Deep Learning</h4>
                <p>Time-series analysis using Long Short-Term Memory networks to capture degradation trends over engine cycles.</p>
              </div>
            </div>

            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Component Health Scoring</h4>
                <p>Real-time health scores (0-100%) calculated via Z-Score deviation from baseline sensor readings.</p>
              </div>
            </div>

            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Uncertainty Quantification</h4>
                <p>Monte Carlo Dropout provides confidence intervals alongside predictions for informed decision-making.</p>
              </div>
            </div>

            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div className="feature-content">
                <h4>Docker Auto-Scaling</h4>
                <p>On-demand worker containers scale dynamically, shutting down after 5 minutes of inactivity for zero-cost idle.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tech-stack">
          <h3 className="tech-title">Technology Stack</h3>
          <div className="tech-logos">
            <div className="tech-item">
              <span className="tech-name">React</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Python</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">FastAPI</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">TensorFlow</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Docker</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Ngrok</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
