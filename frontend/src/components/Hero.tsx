import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grid-overlay"></div>
        <div className="hero-glow"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span className="badge-dot"></span>
            Predictive Maintenance Platform
          </div>
          
          <h1 className="hero-title animate-fade-in-up stagger-1">
            Predict Engine 
            <span className="highlight"> Failures</span> 
            <br />Before They Happen
          </h1>
          
          <p className="hero-description animate-fade-in-up stagger-2">
            Advanced machine learning models analyze turbofan engine sensor data 
            to predict remaining useful life (RUL) and component health scores 
            in real-time.
          </p>

          <div className="hero-actions animate-fade-in-up stagger-3">
            <a href="#models" className="btn btn-primary btn-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Explore Models
            </a>
            <a href="#about" className="btn btn-secondary">
              Learn More
            </a>
          </div>

          <div className="hero-stats animate-fade-in-up stagger-4">
            <div className="hero-stat">
              <span className="hero-stat-value">92%</span>
              <span className="hero-stat-label">Prediction Accuracy</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">21</span>
              <span className="hero-stat-label">Sensor Inputs</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">&lt;4s</span>
              <span className="hero-stat-label">Analysis Time</span>
            </div>
          </div>
        </div>

        <div className="hero-visual animate-fade-in-up stagger-2">
          <div className="engine-display">
            <div className="engine-frame">
              <img 
                src="/src/assets/engine-blueprint.png" 
                alt="Turbofan Engine Blueprint" 
                className="engine-image"
              />
              <div className="engine-scan"></div>
            </div>
            <div className="engine-labels">
              <div className="engine-label label-fan">
                <span className="label-dot"></span>
                <span className="label-text">Fan Module</span>
                <span className="label-value">98%</span>
              </div>
              <div className="engine-label label-hpc">
                <span className="label-dot warning"></span>
                <span className="label-text">HPC</span>
                <span className="label-value">72%</span>
              </div>
              <div className="engine-label label-combustor">
                <span className="label-dot"></span>
                <span className="label-text">Combustor</span>
                <span className="label-value">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-indicator">
        <span>Scroll to explore</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
