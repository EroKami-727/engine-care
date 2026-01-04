// API Service for FastAPI Backend Integration
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
  [key: string]: number;
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
  systemVolatility: number;
  modelName: string;
}

class EngineAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async parseFile(file: File): Promise<number[][]> {
    const text = await file.text();
    const rows = text.trim().split('\n').map(row => 
      row.trim().split(/\s+/).map(Number)
    );
    if (rows.length < 50) throw new Error(`File too short! Need 50+ cycles.`);
    return rows.slice(-50);
  }

  private mapToSensorHistory(rawRows: number[][]): SensorData[] {
    return rawRows.map((row, index) => {
      const data: any = { cycle: index + 1 };
      // Map columns [Op1..3, S1..21]
      data.sensor_2 = row[3] || 0;
      data.sensor_7 = row[8] || 0;
      data.sensor_11 = row[12] || 0;
      data.sensor_21 = row[22] || 0;
      return data as SensorData;
    });
  }

  async predict(request: PredictionRequest): Promise<PredictionResult> {
    try {
      const rawRows = await this.parseFile(request.file);
      const inferenceData = rawRows.map(row => row.slice(2, 26));

      const response = await fetch(`${this.baseUrl}/predict/jet-engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inferenceData }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.statusText}`);

      const apiData = await response.json();

      // --- MAPPING ---
      const rawHealth = apiData.component_health;
      const healthScores: ComponentHealth = {
        fan: rawHealth.Fan || 0,
        lpc: rawHealth.LPC || 0,
        hpc: rawHealth.HPC || 0,
        combustor: rawHealth.Combustor || 0,
        hpt: rawHealth.HPT || 0,
        lpt: rawHealth.LPT || 0,
      };

      const sensorHistory = this.mapToSensorHistory(inferenceData);
      
      // --- IMPROVED TREND GENERATION ---
      // Instead of a straight line, we simulate a non-linear degradation curve
      // extending from "Now" (Cycle 0 relative) to "Failure" (Cycle RUL)
      const degradationTrends: DegradationTrend[] = [];
      const totalRul = Math.floor(apiData.prediction.rul);
      
      // Generate 20 points spanning the future RUL for a smooth curve
      const steps = 20;
      const stepSize = totalRul / steps;

      for(let i = 0; i <= steps; i++) {
        const currentCycle = Math.floor(i * stepSize);
        // Exponential decay simulation: Health drops faster near the end
        const progress = i / steps;
        const decayFactor = Math.pow(progress, 1.5); // Curve the line
        const simulatedHealth = Math.max(0, 100 - (100 * decayFactor));
        
        degradationTrends.push({
            cycle: currentCycle,
            healthIndex: Number(simulatedHealth.toFixed(1)),
            predictedRul: Math.max(0, totalRul - currentCycle)
        });
      }

      return {
        rul: totalRul,
        confidence: 95, 
        riskLevel: apiData.prediction.risk_level, 
        healthScores: healthScores,
        degradationVelocity: apiData.prediction.system_volatility > 20 ? 'High' : 'Low',
        sensorHistory: sensorHistory,
        degradationTrends: degradationTrends,
        systemVolatility: apiData.prediction.system_volatility,
        modelName: apiData.prediction.confidence
      };

    } catch (error) {
      console.error('API Pipeline Failed:', error);
      throw error;
    }
  }

  // Mock for Fallback
  generateMockPrediction(modelId: string): PredictionResult {
    // Generate 50 cycles of fake history
    const sensorHistory: SensorData[] = [];
    const degradationTrends: DegradationTrend[] = [];
    
    // Starting values
    let temp = 1540; 
    let press = 550; 
    let rpm = 2380;  
    let margin = 20; 

    for (let i = 0; i < 50; i++) {
      temp += (Math.random() - 0.4) * 2; 
      press += (Math.random() - 0.6) * 0.5;
      rpm += (Math.random() - 0.5) * 1.5;
      margin -= 0.1; 

      sensorHistory.push({
        cycle: i + 1,
        sensor_2: 642 + (Math.random() * 0.5), 
        sensor_7: press,                       
        sensor_11: rpm,                        
        sensor_21: margin                      
      });

      const decay = Math.pow((i / 50), 2) * 10;
      degradationTrends.push({
        cycle: i + 1,
        healthIndex: Math.max(0, 100 - (i * 0.2)),
        predictedRul: Math.max(0, 125 - i - decay)
      });
    }

    return {
      rul: 85,
      confidence: 80,
      riskLevel: 'Safe',
      // FIX: Use lowercase keys here to match ComponentHealth interface
      healthScores: { 
        fan: 90, 
        lpc: 88, 
        hpc: 85, 
        combustor: 92, 
        hpt: 89, 
        lpt: 87 
      },
      degradationVelocity: 'Low',
      sensorHistory: sensorHistory,
      degradationTrends: degradationTrends,
      systemVolatility: 5.0,
      modelName: "Demo Model (Simulation)"
    };
  }
}

export const engineAPI = new EngineAPIService();
export default engineAPI;