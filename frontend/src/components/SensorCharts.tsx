import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SensorData, DegradationTrend } from '../services/api';
import './SensorCharts.css';

interface SensorChartsProps {
  sensorHistory: SensorData[];
  degradationTrends: DegradationTrend[];
}

const SensorCharts: React.FC<SensorChartsProps> = ({ sensorHistory, degradationTrends }) => {
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Cycle {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sensor-charts">
      <div className="chart-section">
        <div className="chart-header">
          <h3>Sensor Data History</h3>
          <span className="chart-subtitle">Real-time sensor readings</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorHistory} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="cycle" stroke="var(--color-text-muted)" tick={{fontSize: 11}} />
              {/* Auto Domain fixes the "Flat Line" issue */}
              <YAxis domain={['auto', 'auto']} stroke="var(--color-text-muted)" tick={{fontSize: 11}} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line type="monotone" dataKey="sensor_2" name="LPC Temp" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sensor_7" name="HPC Press" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sensor_11" name="Fan Speed" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>Degradation Trends</h3>
          <span className="chart-subtitle">Predicted RUL over time</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={degradationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="rulGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="cycle" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="predictedRul" name="RUL" stroke="#06b6d4" fill="url(#rulGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;