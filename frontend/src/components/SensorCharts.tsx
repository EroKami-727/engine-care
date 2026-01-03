import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SensorData, DegradationTrend } from '../services/api';
import './SensorCharts.css';

interface ChartDataPoint {
  cycle: number;
  [key: string]: number;
}

interface SensorChartsProps {
  sensorHistory: SensorData[];
  degradationTrends: DegradationTrend[];
}

const SensorCharts: React.FC<SensorChartsProps> = ({ sensorHistory, degradationTrends }) => {
  // Convert SensorData to chart-friendly format
  const chartData: ChartDataPoint[] = sensorHistory.map(s => ({
    cycle: s.cycle,
    sensor_2: s.sensor_2,
    sensor_7: s.sensor_7,
    sensor_11: s.sensor_11,
    sensor_21: s.sensor_21,
  }));
  // Select key sensors to display
  const selectedSensors = ['sensor_2', 'sensor_7', 'sensor_11', 'sensor_21'];
  
  const sensorColors: Record<string, string> = {
    sensor_2: '#3b82f6',
    sensor_7: '#06b6d4',
    sensor_11: '#10b981',
    sensor_21: '#f59e0b',
  };

  const sensorLabels: Record<string, string> = {
    sensor_2: 'Total Temperature (Fan)',
    sensor_7: 'Total Temperature (HPC)',
    sensor_11: 'Physical Fan Speed',
    sensor_21: 'Bleed Enthalpy',
  };

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
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Sensor Data History
          </h3>
          <span className="chart-subtitle">Real-time sensor readings over operational cycles</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis 
                dataKey="cycle" 
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{sensorLabels[value] || value}</span>}
              />
              {selectedSensors.map((sensor) => (
                <Line
                  key={sensor}
                  type="monotone"
                  dataKey={sensor}
                  name={sensor}
                  stroke={sensorColors[sensor]}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1500}
                  animationBegin={0}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Degradation Trends
          </h3>
          <span className="chart-subtitle">Health index and predicted RUL over time</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={degradationTrends} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="rulGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis 
                dataKey="cycle" 
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                width={60}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{value}</span>}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="healthIndex"
                name="Health Index"
                stroke="#3b82f6"
                fill="url(#healthGradient)"
                strokeWidth={2}
                animationDuration={1500}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="predictedRul"
                name="Predicted RUL"
                stroke="#06b6d4"
                fill="url(#rulGradient)"
                strokeWidth={2}
                animationDuration={1500}
                animationBegin={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;
