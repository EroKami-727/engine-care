import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CustomCursor from '../components/CustomCursor';
import InteractiveEngine from '../components/InteractiveEngine';
import SensorCharts from '../components/SensorCharts';
import { ModelData } from '../components/ModelCard';
import { engineAPI, PredictionResult } from '../services/api';
import './Results.css';

interface LocationState {
  model: ModelData;
  fileName: string;
  file?: File;
}

const loadingPhases = [
  { id: 1, label: 'Connecting to server...', duration: 1500 },
  { id: 2, label: 'Waking ML worker...', duration: 2000 },
  { id: 3, label: 'Processing dataset...', duration: 2500 },
  { id: 4, label: 'Running inference...', duration: 2000 },
  { id: 5, label: 'Calculating health scores...', duration: 1500 },
  { id: 6, label: 'Generating report...', duration: 1000 },
];

const Results: React.FC = () => {
  const { modelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Model data from state or default
  const model = state?.model || {
    id: modelId || 'rul-predictor',
    name: 'RUL Predictor',
    algorithm: 'LSTM Neural Network',
    predicts: 'Remaining Useful Life (Cycles)',
    badge: 'LSTM'
  };

  const fetchPrediction = useCallback(async () => {
    if (state?.file) {
      try {
        const apiResult = await engineAPI.predict({
          file: state.file,
          modelId: model.id,
        });
        setResults(apiResult);
      } catch (error) {
        console.warn('API not available, using mock data:', error);
        setApiError('API not available - showing demo results');
        setIsUsingMockData(true);
        setResults(engineAPI.generateMockPrediction(model.id));
      }
    } else {
      // No file provided, use mock data
      setIsUsingMockData(true);
      setResults(engineAPI.generateMockPrediction(model.id));
    }
  }, [model.id, state?.file]);

  useEffect(() => {
    let totalDuration = 0;
    loadingPhases.forEach(phase => totalDuration += phase.duration);
    
    let elapsedTime = 0;
    const interval = setInterval(() => {
      elapsedTime += 100;
      const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(progressPercent);

      // Calculate current phase
      let accumulatedTime = 0;
      for (let i = 0; i < loadingPhases.length; i++) {
        accumulatedTime += loadingPhases[i].duration;
        if (elapsedTime < accumulatedTime) {
          setCurrentPhase(i);
          break;
        }
        if (i === loadingPhases.length - 1) {
          setCurrentPhase(loadingPhases.length);
        }
      }

      if (progressPercent >= 100) {
        clearInterval(interval);
        setIsComplete(true);
        fetchPrediction().then(() => {
          setTimeout(() => setShowResults(true), 500);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [fetchPrediction]);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'safe': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'critical': return 'var(--color-danger)';
      default: return 'var(--color-primary)';
    }
  };

  if (!results && showResults) {
    return (
      <div className="results-page">
        <CustomCursor />
        <Header showBack />
        <main className="results-main">
          <div className="container">
            <div className="error-container">
              <h2>Unable to load results</h2>
              <p>Please try again or use a different model.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="results-page">
      <CustomCursor />
      <Header showBack />

      <main className="results-main">
        <div className="container">
          {!showResults ? (
            <div className={`loading-container ${isComplete ? 'fade-out' : ''}`}>
              <div className="loading-visual">
                <div className="loading-ring">
                  <div className="loading-ring-inner"></div>
                </div>
                <div className="loading-percent">
                  <span className="percent-value">{Math.round(progress)}</span>
                  <span className="percent-symbol">%</span>
                </div>
              </div>

              <div className="loading-info">
                <h2 className="loading-title">Analyzing Engine Data</h2>
                <p className="loading-model">{model.name}</p>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="loading-phases">
                {loadingPhases.map((phase, index) => (
                  <div 
                    key={phase.id}
                    className={`loading-phase ${
                      index < currentPhase ? 'complete' : 
                      index === currentPhase ? 'active' : ''
                    }`}
                  >
                    <span className="loading-phase-indicator">
                      {index < currentPhase ? '✓' : index + 1}
                    </span>
                    <span className="loading-phase-text">{phase.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : results && (
            <div className="results-container animate-fade-in-up">
              {(apiError || isUsingMockData) && (
                <div className="demo-banner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  <span>Demo Mode: Showing simulated results. Connect your FastAPI backend for live predictions.</span>
                </div>
              )}

              <div className="results-header">
                <div className="results-badge" style={{ borderColor: getRiskColor(results.riskLevel) }}>
                  <span className="badge-dot" style={{ background: getRiskColor(results.riskLevel) }}></span>
                  {results.riskLevel} Status
                </div>
                <h1 className="results-title">Analysis Complete</h1>
                <p className="results-subtitle">
                  {model.name} • {model.algorithm}
                </p>
              </div>

              {/* Primary Metrics */}
              <div className="primary-metrics-grid">
                <div className="primary-result">
                  <span className="result-label">Predicted Remaining Useful Life</span>
                  <div className="result-value-large">
                    <span className="value-number">{results.rul}</span>
                    <span className="value-unit">Cycles</span>
                  </div>
                  <div className="confidence-bar">
                    <span className="confidence-label">Confidence: {results.confidence}%</span>
                    <div className="confidence-track">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${results.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-side">
                  <div className="metric-card">
                    <span className="metric-label">Risk Level</span>
                    <span 
                      className="metric-value"
                      style={{ color: getRiskColor(results.riskLevel) }}
                    >
                      {results.riskLevel}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Degradation Velocity</span>
                    <span className="metric-value">{results.degradationVelocity}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Engine Diagram */}
              <div className="section-header">
                <h2>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                  Interactive Engine Diagram
                </h2>
                <span className="section-subtitle">Hover over components to view detailed sensor data and health metrics</span>
              </div>
              <InteractiveEngine healthScores={results.healthScores} />

              {/* Sensor Charts */}
              <SensorCharts 
                sensorHistory={results.sensorHistory} 
                degradationTrends={results.degradationTrends} 
              />

              {/* Interpretation Section */}
              <div className="interpretation-section">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  What This Means
                </h3>
                <div className="interpretation-content">
                  <p>
                    Based on the analysis of your engine's sensor data, the <strong>{model.name}</strong> model 
                    predicts approximately <strong>{results.rul} cycles</strong> of remaining useful life with 
                    <strong> {results.confidence}% confidence</strong>.
                  </p>
                  <p>
                    The current risk level is classified as <strong style={{ color: getRiskColor(results.riskLevel) }}>
                    {results.riskLevel}</strong>. The High-Pressure Compressor (HPC) shows the lowest health score 
                    at {results.healthScores.hpc}%, indicating this component should be prioritized for inspection.
                  </p>
                  <p>
                    With a <strong>{results.degradationVelocity.toLowerCase()}</strong> degradation velocity, 
                    the engine is deteriorating at a manageable rate. We recommend scheduling maintenance within 
                    the next {Math.floor(results.rul * 0.7)} cycles to prevent unexpected failures.
                  </p>
                </div>
              </div>

              <div className="results-actions">
                <button className="btn btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
                  </svg>
                  View ML Code
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Use Different Engine
                </button>
                <button className="btn btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Create My Own Dataset
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;
