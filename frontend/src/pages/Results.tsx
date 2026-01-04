import React, { useState, useEffect, useRef } from 'react';
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

// TUNED TIMINGS: Total ~3000ms (3 seconds)
const loadingPhases = [
  { id: 1, label: 'Connecting to server...', duration: 600 },
  { id: 2, label: 'Waking ML worker...', duration: 800 },
  { id: 3, label: 'Processing dataset...', duration: 600 },
  { id: 4, label: 'Running inference...', duration: 500 },
  { id: 5, label: 'Calculating health scores...', duration: 400 },
  { id: 6, label: 'Generating report...', duration: 300 },
];

const Results: React.FC = () => {
  const { modelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  const apiCallStarted = useRef(false);

  const model = state?.model || {
    id: modelId || 'rul-predictor',
    name: 'Transformer v1',
    algorithm: 'Multi-Head Attention',
    predicts: 'RUL (Cycles)',
    badge: 'SOTA'
  };

  const getRiskColor = (level: string) => {
    // Safety Check: handle undefined/null
    if (!level) return 'var(--color-primary)';
    switch (level.toLowerCase()) {
      case 'safe': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'critical': return 'var(--color-danger)';
      default: return 'var(--color-primary)';
    }
  };

  // 1. START API CALL
  useEffect(() => {
    if (apiCallStarted.current) return;
    apiCallStarted.current = true;

    const performPrediction = async () => {
      if (state?.file) {
        try {
          const apiResult = await engineAPI.predict({
            file: state.file,
            modelId: model.id,
          });
          setResults(apiResult);
        } catch (error) {
          console.warn('API Error:', error);
          setApiError('API not available - showing demo results');
          setIsUsingMockData(true);
          setResults(engineAPI.generateMockPrediction(model.id));
        }
      } else {
        setIsUsingMockData(true);
        setResults(engineAPI.generateMockPrediction(model.id));
      }
    };

    performPrediction();
  }, [state?.file, model.id]);

  // 2. RUN ANIMATION
  useEffect(() => {
    let totalDuration = 0;
    loadingPhases.forEach(phase => totalDuration += phase.duration);
    
    let elapsedTime = 0;
    const interval = setInterval(() => {
      elapsedTime += 50; // Faster tick
      const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(progressPercent);

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
        // Ensure API is ready before showing
        const checkResults = setInterval(() => {
            if (results) {
                clearInterval(checkResults);
                setTimeout(() => setShowResults(true), 300);
            }
        }, 100); 
      }
    }, 50);

    return () => clearInterval(interval);
  }, [results]);

  if (!results && showResults) {
    return <div className="results-page">Loading...</div>;
  }

  return (
    <div className="results-page">
      <CustomCursor />
      <Header showBack />

      <main className="results-main">
        <div className="container">
          {!showResults ? (
            <div className="loading-container">
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
                  <span>Demo Mode: API Error.</span>
                </div>
              )}

              <div className="results-header">
                <div className="results-badge" style={{ borderColor: getRiskColor(results.riskLevel) }}>
                  <span className="badge-dot" style={{ background: getRiskColor(results.riskLevel) }}></span>
                  {results.riskLevel} Status
                </div>
                <h1 className="results-title">Analysis Complete</h1>
                <p className="results-subtitle">
                  {results.modelName}
                </p>
              </div>

              {/* Primary Metrics */}
              <div className="primary-metrics-grid">
                <div className="primary-result">
                  <span className="result-label">Predicted Remaining Useful Life</span>
                  <div className="result-value-large">
                    <span className="value-number">{Math.floor(results.rul)}</span>
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
                    <span className="metric-label">Volatility</span>
                    <span className="metric-value">{results.systemVolatility?.toFixed(2) || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Engine Diagram */}
              <div className="section-header">
                <h2>Interactive Engine Diagram</h2>
                <span className="section-subtitle">Hover over components to view detailed sensor data</span>
              </div>
              <InteractiveEngine healthScores={results.healthScores} />

              {/* Sensor Charts */}
              <SensorCharts 
                sensorHistory={results.sensorHistory} 
                degradationTrends={results.degradationTrends} 
              />

              {/* --- RESTORED INTERPRETATION SECTION --- */}
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
                    {results.riskLevel}</strong>. The <strong className="text-white">Fan Module</strong> shows the highest stability, while downstream components may require inspection.
                  </p>
                  <p>
                    With a <strong>{results.degradationVelocity.toLowerCase()}</strong> degradation velocity, 
                    the engine is deteriorating at a manageable rate. We recommend scheduling maintenance within 
                    the next {Math.floor(results.rul * 0.7)} cycles to prevent unexpected failures.
                  </p>
                </div>
              </div>

              {/* --- RESTORED ACTIONS --- */}
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