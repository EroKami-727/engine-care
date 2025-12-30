import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LiveChartProps {
  data: number[][]; // 50 rows x 24 features
  isPlaying: boolean;
  onComplete: () => void;
}

const LiveChart: React.FC<LiveChartProps> = ({ data, isPlaying, onComplete }) => {
  const [visibleData, setVisibleData] = useState<any[]>([]);

  useEffect(() => {
    if (!isPlaying || !data || data.length === 0) return;

    setVisibleData([]); // Reset
    let index = 0;

    const interval = setInterval(() => {
      if (index >= data.length) {
        clearInterval(interval);
        onComplete();
        return;
      }

      // We visualize Sensor 11 (Combustion) or Sensor 4 (Turbine Temp)
      // Index 14 in the sequence is Sensor 12 (Combustion Ratio) -> Good visual
      // Index 6 in the sequence is Sensor 4 (Turbine Temp) -> Also good
      const point = {
        cycle: index,
        value: data[index][6] // Plotting Turbine Temp
      };

      setVisibleData(prev => [...prev, point]);
      index++;
    }, 40); // 40ms * 50 frames = 2 seconds total duration

    return () => clearInterval(interval);
  }, [isPlaying, data]);

  return (
    <div className="w-full h-48 bg-black/20 rounded-lg p-2 backdrop-blur-sm border border-white/5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={visibleData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-right text-xs text-slate-500 mt-1">LPT Exhaust Temperature (Live)</div>
    </div>
  );
};

export default LiveChart;