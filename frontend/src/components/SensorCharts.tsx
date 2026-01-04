import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SensorData, DegradationTrend } from '../services/api';
import { useInView } from '../hooks/useInView'; // Import the hook
import './SensorCharts.css';

interface SensorChartsProps {
  sensorHistory: SensorData[];
  degradationTrends: DegradationTrend[];
}

const SensorCharts: React.FC<SensorChartsProps> = ({ sensorHistory, degradationTrends }) => {
  
  // 1. Create refs for scroll detection
  const [chart1Ref, chart1InView] = useInView({ threshold: 0.3 });
  const [chart2Ref, chart2InView] = useInView({ threshold: 0.3 });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Cycle {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="sensor-charts">
      
      {/* CHART 1: SENSOR HISTORY */}
      {/* Add ref and conditional class */}
      <div 
        ref={chart1Ref} 
        className={`chart-section ${chart1InView ? 'animate-in' : 'hidden-section'}`}
      >
        <div className="chart-header">
          <h3>Live Telemetry (Key Sensors)</h3>
          <span className="chart-subtitle">Real-time deviations in Temperature (T24, T30) and Speed (Nf)</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            {/* key prop forces re-render when inView becomes true, restarting the line animation */}
            <LineChart key={chart1InView ? 'c1-visible' : 'c1-hidden'} data={sensorHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="cycle" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 12}} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line type="monotone" dataKey="sensor_2" name="LPC Temp" stroke="#3b82f6" strokeWidth={2} dot={false} animationDuration={2000} />
              <Line type="monotone" dataKey="sensor_7" name="HPC Press" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={2000} />
              <Line type="monotone" dataKey="sensor_11" name="Fan Speed" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={2000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: DEGRADATION TREND */}
      <div 
        ref={chart2Ref} 
        className={`chart-section ${chart2InView ? 'animate-in' : 'hidden-section'}`}
      >
        <div className="chart-header">
          <h3>Degradation Forecast</h3>
          <span className="chart-subtitle">Projected RUL decay vs. Estimated Health Index</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart key={chart2InView ? 'c2-visible' : 'c2-hidden'} data={degradationTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <Area type="monotone" dataKey="predictedRul" name="RUL" stroke="#06b6d4" fill="url(#rulGradient)" strokeWidth={2} animationDuration={2000} />
              <Line type="monotone" dataKey="healthIndex" name="Health Index %" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default SensorCharts;