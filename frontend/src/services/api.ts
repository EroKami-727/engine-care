// API Service for FastAPI Backend Integration
// Connects to your Python FastAPI backend for ML predictions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PredictionRequest {
  file: File;
  modelId: string;
}

export interface ComponentHealth {
  fan: number;
  lpc: number;
  hpc: number;
  combustor: number;
  hpt: number;
  lpt: number;
}

export interface SensorData {
  cycle: number;
  sensor_2: number;
  sensor_3: number;
  sensor_4: number;
  sensor_7: number;
  sensor_8: number;
  sensor_9: number;
  sensor_11: number;
  sensor_12: number;
  sensor_13: number;
  sensor_14: number;
  sensor_15: number;
  sensor_17: number;
  sensor_20: number;
  sensor_21: number;
}

export interface DegradationTrend {
  cycle: number;
  healthIndex: number;
  predictedRul: number;
}

export interface PredictionResult {
  rul: number;
  confidence: number;
  riskLevel: 'Safe' | 'Warning' | 'Critical';
  healthScores: ComponentHealth;
  degradationVelocity: 'Low' | 'Moderate' | 'High';
  sensorHistory: SensorData[];
  degradationTrends: DegradationTrend[];
}

export interface APIError {
  message: string;
  code: string;
}

class EngineAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async predict(request: PredictionRequest): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('model_id', request.modelId);

    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Prediction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<{ id: string; name: string; description: string }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }

  // Generate mock data for demo when API is not available
  generateMockPrediction(modelId: string): PredictionResult {
    const baseRul = Math.floor(Math.random() * 80) + 20;
    const confidence = Math.floor(Math.random() * 15) + 80;
    
    const healthScores: ComponentHealth = {
      fan: Math.floor(Math.random() * 15) + 85,
      lpc: Math.floor(Math.random() * 20) + 75,
      hpc: Math.floor(Math.random() * 30) + 60,
      combustor: Math.floor(Math.random() * 15) + 80,
      hpt: Math.floor(Math.random() * 25) + 70,
      lpt: Math.floor(Math.random() * 20) + 75,
    };

    const avgHealth = Object.values(healthScores).reduce((a, b) => a + b, 0) / 6;
    let riskLevel: 'Safe' | 'Warning' | 'Critical' = 'Safe';
    if (avgHealth < 70) riskLevel = 'Critical';
    else if (avgHealth < 80) riskLevel = 'Warning';

    // Generate sensor history data
    const sensorHistory: SensorData[] = [];
    for (let i = 0; i < 50; i++) {
      sensorHistory.push({
        cycle: i + 1,
        sensor_2: 641.82 + Math.random() * 2 - 1,
        sensor_3: 1589.7 + Math.random() * 10 - 5,
        sensor_4: 1400.6 + Math.random() * 8 - 4,
        sensor_7: 553.75 + Math.random() * 5 - 2.5,
        sensor_8: 2388.0 + Math.random() * 10 - 5,
        sensor_9: 9046.19 + Math.random() * 20 - 10,
        sensor_11: 47.47 + Math.random() * 0.5 - 0.25,
        sensor_12: 521.66 + Math.random() * 5 - 2.5,
        sensor_13: 2388.02 + Math.random() * 10 - 5,
        sensor_14: 8138.62 + Math.random() * 30 - 15,
        sensor_15: 8.4195 + Math.random() * 0.05 - 0.025,
        sensor_17: 392 + Math.random() * 2 - 1,
        sensor_20: 39.06 + Math.random() * 0.5 - 0.25,
        sensor_21: 23.419 + Math.random() * 0.2 - 0.1,
      });
    }

    // Generate degradation trends
    const degradationTrends: DegradationTrend[] = [];
    let healthIndex = 100;
    for (let i = 0; i < 100; i++) {
      const decay = 0.3 + Math.random() * 0.2;
      healthIndex = Math.max(0, healthIndex - decay);
      degradationTrends.push({
        cycle: i + 1,
        healthIndex: Math.round(healthIndex * 100) / 100,
        predictedRul: Math.max(0, baseRul - Math.floor(i * 0.5)),
      });
    }

    return {
      rul: baseRul,
      confidence,
      riskLevel,
      healthScores,
      degradationVelocity: avgHealth > 80 ? 'Low' : avgHealth > 70 ? 'Moderate' : 'High',
      sensorHistory,
      degradationTrends,
    };
  }
}

export const engineAPI = new EngineAPIService();
export default engineAPI;
