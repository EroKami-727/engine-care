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

const modelsData: ModelData[] =[
  {
    id: 'rul-predictor',
    name: 'Regime-Aware RUL Predictor',
    description: 'Advanced predictive maintenance engine evaluating NASA C-MAPSS turbofan telemetry. Features Regime-Aware Logic to dynamically route steady-state or high-load data to specialized LSTM networks using a 50-cycle lookback window. Simultaneously derives granular health indexes for the Fan, High-Pressure Compressor (HPC), Combustor, and Turbines.',
    algorithm: 'Dual LSTM Networks with Regime Routing',
    predicts: 'Piecewise Remaining Useful Life & Subsystem Health',
    accuracy: 'Optimized (Robust Scaling + Asymmetric PHM)',
    speed: 'Zero-Ops FastAPI Orchestrator (~20MB Idle)',
    badge: 'TensorFlow / Keras',
    techTags: ['50-Cycle Lookback', 'Regime-Aware Logic', 'Robust Scaling', 'Visual Twin'],
    image: engineBlueprint,
    dataInfo: 'Accepts 21 sensor readings + 3 operational settings. Handles multi-condition flights (FD002/FD004) natively.'
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
            <span className="section-subtitle">Powered by Deep Learning</span>
            <p className="section-description">
              A condition-based maintenance algorithm trained on the NASA C-MAPSS dataset. Replaces schedule-based maintenance with high-accuracy, run-to-failure forecasting.
            </p>
          </div>

          {/* Added 'single-card-layout' class here */}
          <div className="models-grid single-card-layout">
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