import React, { useState } from 'react';
import './InteractiveEngine.css';

interface ComponentHealth {
  fan: number;
  lpc: number;
  hpc: number;
  combustor: number;
  hpt: number;
  lpt: number;
}

interface SensorInfo {
  name: string;
  fullName: string;
  health: number;
  sensors: { name: string; value: string; unit: string }[];
  description: string;
}

interface InteractiveEngineProps {
  healthScores: ComponentHealth;
}

const InteractiveEngine: React.FC<InteractiveEngineProps> = ({ healthScores }) => {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const componentData: Record<string, SensorInfo> = {
    fan: {
      name: 'FAN',
      fullName: 'Fan Section',
      health: healthScores.fan,
      sensors: [
        { name: 'T2', value: '641.82', unit: '°R' },
        { name: 'NF', value: '2388.0', unit: 'RPM' },
        { name: 'BPR', value: '8.42', unit: '' },
      ],
      description: 'Inlet fan for primary air compression. First stage of the compression system.',
    },
    lpc: {
      name: 'LPC',
      fullName: 'Low Pressure Compressor',
      health: healthScores.lpc,
      sensors: [
        { name: 'T24', value: '641.82', unit: '°R' },
        { name: 'P30', value: '521.66', unit: 'psia' },
        { name: 'NF', value: '2388.0', unit: 'RPM' },
      ],
      description: 'Increases air pressure before entering the high pressure compressor section.',
    },
    hpc: {
      name: 'HPC',
      fullName: 'High Pressure Compressor',
      health: healthScores.hpc,
      sensors: [
        { name: 'T30', value: '1589.70', unit: '°R' },
        { name: 'P30', value: '553.75', unit: 'psia' },
        { name: 'NC', value: '9046.19', unit: 'RPM' },
      ],
      description: 'Final compression stage. Critical component for engine efficiency and power output.',
    },
    combustor: {
      name: 'COMB',
      fullName: 'Combustion Chamber',
      health: healthScores.combustor,
      sensors: [
        { name: 'T40', value: '1400.60', unit: '°R' },
        { name: 'Phi', value: '521.66', unit: '' },
        { name: 'PSI', value: '47.47', unit: '' },
      ],
      description: 'Fuel-air mixture combustion area. Generates high-temperature exhaust gases.',
    },
    hpt: {
      name: 'HPT',
      fullName: 'High Pressure Turbine',
      health: healthScores.hpt,
      sensors: [
        { name: 'T50', value: '1131.50', unit: '°R' },
        { name: 'NC', value: '9046.19', unit: 'RPM' },
        { name: 'EFF', value: '85.2', unit: '%' },
      ],
      description: 'Extracts energy from exhaust gases to drive the high pressure compressor.',
    },
    lpt: {
      name: 'LPT',
      fullName: 'Low Pressure Turbine',
      health: healthScores.lpt,
      sensors: [
        { name: 'T50', value: '1131.50', unit: '°R' },
        { name: 'NF', value: '2388.0', unit: 'RPM' },
        { name: 'EFF', value: '87.8', unit: '%' },
      ],
      description: 'Powers the fan and low pressure compressor. Final energy extraction stage.',
    },
  };

  const getHealthColor = (health: number): string => {
    if (health >= 80) return 'var(--color-success)';
    if (health >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getHealthClass = (health: number): string => {
    if (health >= 80) return 'healthy';
    if (health >= 50) return 'warning';
    return 'critical';
  };

  const handleMouseEnter = (component: string, e: React.MouseEvent) => {
    setHoveredComponent(component);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredComponent(null);
  };

  return (
    <div className="interactive-engine">
      <div className="engine-diagram">
        <svg viewBox="0 0 800 300" className="engine-svg">
          {/* Background grid */}
          <defs>
            <pattern id="engineGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#engineGrid)"/>
          
          {/* Engine outline */}
          <path
            d="M 50 150 L 100 80 L 200 60 L 350 50 L 500 50 L 650 60 L 750 100 L 770 150 L 750 200 L 650 240 L 500 250 L 350 250 L 200 240 L 100 220 L 50 150 Z"
            fill="none"
            stroke="var(--color-border-strong)"
            strokeWidth="2"
          />

          {/* Fan Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.fan)} ${hoveredComponent === 'fan' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('fan', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="80" y="70" width="60" height="160" rx="4" className="component-bg"/>
            <path d="M 110 80 L 110 220" stroke="currentColor" strokeWidth="3"/>
            <ellipse cx="110" cy="100" rx="25" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <ellipse cx="110" cy="130" rx="25" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <ellipse cx="110" cy="160" rx="25" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <ellipse cx="110" cy="190" rx="25" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <text x="110" y="240" className="component-label">FAN</text>
            <circle cx="130" cy="75" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.fan) }}/>
          </g>

          {/* LPC Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.lpc)} ${hoveredComponent === 'lpc' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('lpc', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="160" y="60" width="80" height="180" rx="4" className="component-bg"/>
            <path d="M 180 70 L 220 70" stroke="currentColor" strokeWidth="2"/>
            <path d="M 180 100 L 220 100" stroke="currentColor" strokeWidth="2"/>
            <path d="M 180 130 L 220 130" stroke="currentColor" strokeWidth="2"/>
            <path d="M 180 160 L 220 160" stroke="currentColor" strokeWidth="2"/>
            <path d="M 180 190 L 220 190" stroke="currentColor" strokeWidth="2"/>
            <path d="M 180 220 L 220 220" stroke="currentColor" strokeWidth="2"/>
            <text x="200" y="255" className="component-label">LPC</text>
            <circle cx="230" cy="65" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.lpc) }}/>
          </g>

          {/* HPC Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.hpc)} ${hoveredComponent === 'hpc' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('hpc', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="260" y="50" width="100" height="200" rx="4" className="component-bg"/>
            <path d="M 280 60 L 340 60" stroke="currentColor" strokeWidth="2"/>
            <path d="M 275 85 L 345 85" stroke="currentColor" strokeWidth="2"/>
            <path d="M 270 110 L 350 110" stroke="currentColor" strokeWidth="2"/>
            <path d="M 270 135 L 350 135" stroke="currentColor" strokeWidth="2"/>
            <path d="M 270 160 L 350 160" stroke="currentColor" strokeWidth="2"/>
            <path d="M 270 185 L 350 185" stroke="currentColor" strokeWidth="2"/>
            <path d="M 275 210 L 345 210" stroke="currentColor" strokeWidth="2"/>
            <path d="M 280 235 L 340 235" stroke="currentColor" strokeWidth="2"/>
            <text x="310" y="265" className="component-label">HPC</text>
            <circle cx="350" cy="55" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.hpc) }}/>
          </g>

          {/* Combustor Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.combustor)} ${hoveredComponent === 'combustor' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('combustor', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="380" y="50" width="80" height="200" rx="4" className="component-bg"/>
            <ellipse cx="420" cy="150" rx="30" ry="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
            <circle cx="420" cy="100" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="420" cy="150" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="420" cy="200" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <text x="420" y="265" className="component-label">COMB</text>
            <circle cx="450" cy="55" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.combustor) }}/>
          </g>

          {/* HPT Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.hpt)} ${hoveredComponent === 'hpt' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('hpt', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="480" y="50" width="80" height="200" rx="4" className="component-bg"/>
            <path d="M 500 70 L 540 70 L 535 80 L 505 80 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 500 100 L 540 100 L 535 110 L 505 110 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 500 130 L 540 130 L 535 140 L 505 140 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 500 160 L 540 160 L 535 170 L 505 170 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 500 190 L 540 190 L 535 200 L 505 200 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 500 220 L 540 220 L 535 230 L 505 230 Z" fill="currentColor" opacity="0.5"/>
            <text x="520" y="265" className="component-label">HPT</text>
            <circle cx="550" cy="55" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.hpt) }}/>
          </g>

          {/* LPT Section */}
          <g
            className={`engine-component ${getHealthClass(healthScores.lpt)} ${hoveredComponent === 'lpt' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('lpt', e)}
            onMouseLeave={handleMouseLeave}
          >
            <rect x="580" y="55" width="100" height="190" rx="4" className="component-bg"/>
            <path d="M 600 75 L 660 75 L 655 85 L 605 85 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 600 110 L 660 110 L 655 120 L 605 120 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 600 145 L 660 145 L 655 155 L 605 155 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 600 180 L 660 180 L 655 190 L 605 190 Z" fill="currentColor" opacity="0.5"/>
            <path d="M 600 215 L 660 215 L 655 225 L 605 225 Z" fill="currentColor" opacity="0.5"/>
            <text x="630" y="260" className="component-label">LPT</text>
            <circle cx="670" cy="60" r="6" className="health-indicator" style={{ fill: getHealthColor(healthScores.lpt) }}/>
          </g>

          {/* Exhaust nozzle */}
          <path
            d="M 700 80 L 760 120 L 760 180 L 700 220"
            fill="none"
            stroke="var(--color-border-strong)"
            strokeWidth="2"
          />

          {/* Flow arrows */}
          <g className="flow-arrows" opacity="0.4">
            <path d="M 40 150 L 70 150" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
              </marker>
            </defs>
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredComponent && componentData[hoveredComponent] && (
        <div 
          className="engine-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="tooltip-header">
            <span 
              className="tooltip-health-badge"
              style={{ backgroundColor: getHealthColor(componentData[hoveredComponent].health) }}
            >
              {componentData[hoveredComponent].health}%
            </span>
            <div className="tooltip-title">
              <h4>{componentData[hoveredComponent].fullName}</h4>
              <span className="tooltip-code">{componentData[hoveredComponent].name}</span>
            </div>
          </div>
          <p className="tooltip-description">{componentData[hoveredComponent].description}</p>
          <div className="tooltip-sensors">
            <span className="sensors-title">Live Sensors</span>
            <div className="sensors-grid">
              {componentData[hoveredComponent].sensors.map((sensor, idx) => (
                <div key={idx} className="sensor-item">
                  <span className="sensor-name">{sensor.name}</span>
                  <span className="sensor-value">{sensor.value} <small>{sensor.unit}</small></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="engine-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--color-success)' }}></span>
          <span>Healthy (80%+)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--color-warning)' }}></span>
          <span>Warning (50-79%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--color-danger)' }}></span>
          <span>Critical (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEngine;
