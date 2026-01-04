import React, { useState, useRef } from 'react';
import './InteractiveEngine.css';
import engineBg from '../assets/engine-wireframe.png'; 

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
  const containerRef = useRef<HTMLDivElement>(null);

  const componentData: Record<string, SensorInfo> = {
    fan: {
      name: 'FAN',
      fullName: 'Fan Module',
      health: healthScores.fan,
      sensors: [{ name: 'T2', value: '642', unit: '°R' }, { name: 'Nf', value: '2388', unit: 'RPM' }],
      description: 'Primary air intake. Large blades accelerate bypass air.',
    },
    lpc: {
      name: 'LPC',
      fullName: 'Low Pressure Compressor',
      health: healthScores.lpc,
      sensors: [{ name: 'P2.5', value: '21', unit: 'psia' }, { name: 'T2.5', value: '580', unit: '°R' }],
      description: 'Intermediate compression stage for core airflow.',
    },
    hpc: {
      name: 'HPC',
      fullName: 'High Pressure Compressor',
      health: healthScores.hpc,
      sensors: [{ name: 'Ps30', value: '553', unit: 'psia' }, { name: 'T30', value: '1589', unit: '°R' }],
      description: 'Core compression. Highest pressure point in the engine.',
    },
    combustor: {
      name: 'COMB',
      fullName: 'Combustion Chamber',
      health: healthScores.combustor,
      sensors: [{ name: 'T40', value: '1400', unit: '°R' }, { name: 'Wf', value: '5.2', unit: 'pps' }],
      description: 'Fuel injection and ignition zone.',
    },
    hpt: {
      name: 'HPT',
      fullName: 'High Pressure Turbine',
      health: healthScores.hpt,
      sensors: [{ name: 'T48', value: '1850', unit: '°R' }, { name: 'Eff', value: '92', unit: '%' }],
      description: 'Extracts high-energy gas to drive the HPC.',
    },
    lpt: {
      name: 'LPT',
      fullName: 'Low Pressure Turbine',
      health: healthScores.lpt,
      sensors: [{ name: 'T50', value: '1130', unit: '°R' }, { name: 'P50', value: '18', unit: 'psia' }],
      description: 'Extracts remaining energy to drive the Fan and LPC.',
    },
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return '#10b981'; // Emerald
    if (health >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const handleMouseMove = (component: string, e: React.MouseEvent) => {
    setHoveredComponent(component);
    
    if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // X = Mouse X relative to container
        const x = e.clientX - containerRect.left; 
        
        // Y = Mouse Y relative to container
        // We use this exact mouse position, and CSS 'margin-top: -20px' 
        // plus 'transform: translateY(-100%)' handles the lift.
        const y = e.clientY - containerRect.top; 

        setTooltipPosition({ x, y });
    }
  };

  return (
    <div className="interactive-engine" ref={containerRef}>
      <div className="engine-diagram">
        <img src={engineBg} alt="Engine Blueprint" className="engine-bg-layer" />

        <svg viewBox="0 0 1600 900" className="overlay-svg" preserveAspectRatio="none">
          
          {/* FAN */}
          <polygon 
            points="220,300 400,280 400,620 220,600 150,450" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.fan) }}
            onMouseMove={(e) => handleMouseMove('fan', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

          {/* LPC */}
          <polygon 
            points="410,290 550,320 550,580 410,610" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.lpc) }}
            onMouseMove={(e) => handleMouseMove('lpc', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

          {/* HPC */}
          <polygon 
            points="560,330 850,330 850,570 560,570" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.hpc) }}
            onMouseMove={(e) => handleMouseMove('hpc', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

          {/* COMBUSTOR */}
          <polygon 
            points="860,330 1000,330 1000,570 860,570" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.combustor) }}
            onMouseMove={(e) => handleMouseMove('combustor', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

          {/* HPT */}
          <polygon 
            points="1010,320 1150,300 1150,600 1010,580" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.hpt) }}
            onMouseMove={(e) => handleMouseMove('hpt', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

          {/* LPT */}
          <polygon 
            points="1160,300 1450,350 1450,550 1160,600" 
            className="component-hitbox"
            style={{ color: getHealthColor(healthScores.lpt) }}
            onMouseMove={(e) => handleMouseMove('lpt', e)}
            onMouseLeave={() => setHoveredComponent(null)}
          />

        </svg>
      </div>

      {/* DYNAMIC TOOLTIP */}
      {hoveredComponent && componentData[hoveredComponent] && (
        <div 
          className="engine-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
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

      {/* Legend */}
      <div className="engine-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#10b981' }}></span>
          <span>Nominal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#eab308' }}></span>
          <span>Warning</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }}></span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEngine;