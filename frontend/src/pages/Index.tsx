import React, { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ModelCard, { ModelData } from '../components/ModelCard';
import UploadModal from '../components/UploadModal';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';
import engineBlueprint from '../assets/engine-blueprint.png';
import './Index.css';

const modelsData: ModelData[] = [
  {
    id: 'rul-predictor',
    name: 'RUL Predictor',
    description: 'Predicts the Remaining Useful Life (RUL) of turbofan engines using Long Short-Term Memory neural networks. Analyzes time-series sensor data to forecast cycles until failure.',
    algorithm: 'LSTM Neural Network',
    predicts: 'Remaining Useful Life (Cycles)',
    accuracy: '92%',
    speed: '~4s',
    badge: 'LSTM',
    techTags: ['TensorFlow', 'Time-Series', 'Deep Learning'],
    image: engineBlueprint,
    dataInfo: 'NASA C-MAPSS format: 21 sensor columns + 3 operational settings, time-series per engine unit'
  },
  {
    id: 'health-analyzer',
    name: 'Health Analyzer',
    description: 'Calculates real-time health scores (0-100%) for individual engine components using Z-Score deviation analysis from baseline sensor readings during healthy operation.',
    algorithm: 'Z-Score Statistical Analysis',
    predicts: 'Component Health Scores (0-100%)',
    accuracy: '95%',
    speed: '~2s',
    badge: 'Stats',
    techTags: ['Statistical Analysis', 'Anomaly Detection'],
    image: engineBlueprint,
    dataInfo: 'Sensor readings with baseline reference from cycles 0-10 for calibration'
  },
  {
    id: 'risk-classifier',
    name: 'Risk Classifier',
    description: 'Classifies engine risk level based on RUL predictions and rate of degradation. Outputs categorical status: Safe, Warning, or Critical for maintenance prioritization.',
    algorithm: 'Ensemble Classifier',
    predicts: 'Risk Level (Safe/Warning/Critical)',
    accuracy: '94%',
    speed: '~1s',
    badge: 'Classification',
    techTags: ['Random Forest', 'Ensemble', 'Classification'],
    image: engineBlueprint,
    dataInfo: 'RUL predictions combined with degradation velocity metrics'
  },
  {
    id: 'degradation-tracker',
    name: 'Degradation Tracker',
    description: 'Monitors degradation velocity to determine if engine failure is progressing linearly or exponentially. Uses slope analysis of the last N data points.',
    algorithm: 'Regression Analysis',
    predicts: 'Degradation Velocity Pattern',
    accuracy: '89%',
    speed: '~1.5s',
    badge: 'Regression',
    techTags: ['Linear Regression', 'Trend Analysis'],
    image: engineBlueprint,
    dataInfo: 'Historical sensor data with minimum 50 cycles for accurate trend detection'
  }
];

const Index: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);

  return (
    <div className="index-page">
      <CustomCursor />
      <Header />
      <Hero />

      <section id="models" className="section models-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Powered by Machine Learning</span>
            <h2 className="section-title">Our Models</h2>
            <p className="section-description">
              Advanced predictive maintenance algorithms trained on NASA C-MAPSS turbofan engine dataset.
            </p>
          </div>

          <div className="models-grid">
            {modelsData.map((model, index) => (
              <ModelCard 
                key={model.id}
                model={model}
                index={index}
                onUseModel={setSelectedModel}
              />
            ))}
          </div>
        </div>
      </section>

      <About />
      <FAQ />
      <Footer />

      {selectedModel && (
        <UploadModal 
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
};

export default Index;
