import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModelData } from './ModelCard';
import './UploadModal.css';

interface UploadModalProps {
  model: ModelData;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ model, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = () => {
    navigate(`/results/${model.id}`, { state: { model, fileName: file?.name, file } });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal upload-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-tag">{model.badge}</span>
            <h2 className="modal-title">Upload Dataset</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="modal-body-scroll">
          <div className="modal-content-grid">
            <div className="model-info-panel">
              <div className="model-info-header">
                <div className="model-info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <h3>Model Information</h3>
              </div>
              
              <div className="model-info-list">
                <div className="info-item">
                  <span className="info-label">Model Name</span>
                  <span className="info-value">{model.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Algorithm</span>
                  <span className="info-value">{model.algorithm}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Prediction Target</span>
                  <span className="info-value">{model.predicts}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Required Data Format</span>
                  <span className="info-value">{model.dataInfo}</span>
                </div>
              </div>

              <div className="data-requirements">
                <h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Data Requirements
                </h4>
                <ul>
                  <li>Time-series sensor data from turbofan engines</li>
                  <li>NASA C-MAPSS format (21 sensor columns + 3 operational settings)</li>
                  <li>Include unit number and cycle columns</li>
                  <li>CSV format with header row recommended</li>
                </ul>
              </div>
            </div>

            <div className="upload-section">
              <div 
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  hidden
                />
                
                {file ? (
                  <div className="upload-success">
                    <div className="success-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    <button 
                      className="btn-change-file"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <span className="upload-title">Drop your dataset here</span>
                    <span className="upload-subtitle">or click to browse</span>
                    <div className="upload-formats">
                      <span className="format-badge">Any File</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            disabled={!file}
            onClick={handleAnalyze}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
