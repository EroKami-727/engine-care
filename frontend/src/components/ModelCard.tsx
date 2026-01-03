import React from 'react';
import './ModelCard.css';

export interface ModelData {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  predicts: string;
  accuracy: string;
  speed: string;
  badge: string;
  techTags: string[];
  image: string;
  dataInfo: string;
}

interface ModelCardProps {
  model: ModelData;
  index: number;
  onUseModel: (model: ModelData) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, index, onUseModel }) => {
  return (
    <article 
      className="model-card animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="model-card-image">
        <img src={model.image} alt={`${model.name} visualization`} />
        <div className="model-card-badge">{model.badge}</div>
        <div className="model-card-overlay">
          <div className="overlay-content">
            <span className="overlay-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </span>
            <span className="overlay-text">Explore Model</span>
          </div>
        </div>
      </div>

      <div className="model-card-content">
        <h3 className="model-card-title">{model.name}</h3>
        
        <div className="model-card-tech">
          {model.techTags.map((tag, i) => (
            <span key={i} className="tech-tag">{tag}</span>
          ))}
        </div>

        <p className="model-card-description">{model.description}</p>

        <div className="model-card-predicts">
          <span className="predicts-label">Predicts:</span>
          <span className="predicts-value">{model.predicts}</span>
        </div>

        <div className="model-card-footer">
          <div className="model-card-stats">
            <div className="stat">
              <span className="stat-value">{model.accuracy}</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat">
              <span className="stat-value">{model.speed}</span>
              <span className="stat-label">Speed</span>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-use-model"
            onClick={() => onUseModel(model)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Use Model
          </button>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="card-corner top-left"></div>
      <div className="card-corner top-right"></div>
      <div className="card-corner bottom-left"></div>
      <div className="card-corner bottom-right"></div>
    </article>
  );
};

export default ModelCard;
