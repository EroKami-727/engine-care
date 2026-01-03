import React from "react";

// Updated to match the new 6-component logic
interface HealthScores {
  Fan: number;
  LPC: number;
  HPC: number;
  Combustor: number;
  HPT: number;
  LPT: number;
}

interface EngineSchematicProps {
  healthScores?: HealthScores;
}

const EngineSchematic: React.FC<EngineSchematicProps> = ({ healthScores }) => {
  // Default to 100% health if no data yet
  const scores = healthScores || { 
    Fan: 100, LPC: 100, HPC: 100, Combustor: 100, HPT: 100, LPT: 100 
  };

  const getColor = (score: number) => {
    if (score > 80) return "#10b981"; // Emerald-500
    if (score > 50) return "#eab308"; // Yellow-500
    return "#ef4444"; // Red-500
  };

  const getGlow = (score: number) => {
    if (score <= 50) return "drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))";
    return "none";
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox="0 0 800 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[300px]"
      >
        {/* --- SHELL (Structure) --- */}
        <path
          d="M50 70 L200 60 L600 80 L750 100 V200 L600 220 L200 240 L50 230 Z"
          stroke="#475569"
          strokeWidth="2"
          fill="transparent"
          opacity="0.5"
        />

        {/* --- FAN --- */}
        <g id="fan" style={{ filter: getGlow(scores.Fan) }}>
          <rect
            x="60"
            y="75"
            width="40"
            height="150"
            rx="5"
            fill={getColor(scores.Fan)}
            className="transition-colors duration-500"
          />
          <text x="65" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">FAN</text>
        </g>

        {/* --- LPC (Low Pressure Compressor) --- */}
        <g id="lpc" style={{ filter: getGlow(scores.LPC) }}>
          <rect
            x="120"
            y="90"
            width="50"
            height="120"
            fill={getColor(scores.LPC)}
            className="transition-colors duration-500"
          />
          <text x="125" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">LPC</text>
        </g>

        {/* --- HPC (High Pressure Compressor) --- */}
        <g id="hpc" style={{ filter: getGlow(scores.HPC) }}>
          <rect
            x="180"
            y="100"
            width="70"
            height="100"
            fill={getColor(scores.HPC)}
            className="transition-colors duration-500"
          />
          <text x="190" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">HPC</text>
        </g>

        {/* --- COMBUSTOR (Burner) --- */}
        <g id="combustor" style={{ filter: getGlow(scores.Combustor) }}>
          <rect
            x="260"
            y="110"
            width="60"
            height="80"
            fill={getColor(scores.Combustor)}
            className="transition-colors duration-500"
          />
          {/* Flame indicator */}
          <circle cx="290" cy="150" r="5" fill="white" opacity="0.5" />
          <text x="260" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">BURN</text>
        </g>

        {/* --- HPT (High Pressure Turbine) --- */}
        <g id="hpt" style={{ filter: getGlow(scores.HPT) }}>
          <rect
            x="330"
            y="100"
            width="40"
            height="100"
            fill={getColor(scores.HPT)}
            className="transition-colors duration-500"
          />
          <text x="330" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">HPT</text>
        </g>

        {/* --- LPT (Low Pressure Turbine) --- */}
        <g id="lpt" style={{ filter: getGlow(scores.LPT) }}>
          <rect
            x="380"
            y="90"
            width="50"
            height="120"
            fill={getColor(scores.LPT)}
            className="transition-colors duration-500"
          />
          <text x="390" y="250" fill="#94a3b8" fontSize="10" fontFamily="monospace">LPT</text>
        </g>

        {/* --- EXHAUST --- */}
        <path d="M440 90 L750 110 V190 L440 210" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />
        
      </svg>
    </div>
  );
};

export default EngineSchematic;