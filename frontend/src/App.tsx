import { useState, useRef } from 'react';
import EngineSchematic from './components/EngineSchematic';
import LiveChart from './components/LiveChart';
import './App.css';

// --- CONFIGURATION ---
// If VITE_API_URL is set (in Vercel), use it. Otherwise default to Localhost (for you).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- TYPES ---
interface PredictionResult {
  prediction?: {
    rul: number;
    risk_level: string;
    confidence: string;
    system_volatility: number;
  };
  component_health?: {
    Fan: number;
    LPC: number;
    HPC: number;
    Combustor: number;
    HPT: number;
    LPT: number;
  };
  detail?: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function App() {
  const [mode, setMode] = useState<'sim' | 'upload'>('sim');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [graphData, setGraphData] = useState<number[][]>([]);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]); // New Log State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. SIMULATION MODE ---
  const startSimulation = async () => {
    setLoading(true);
    setResult(null);
    setSimulating(false);
    setLogs(["[SYSTEM] Initializing Zero-Ops Protocol..."]);

    try {
      await delay(500);
      setLogs(prev => [...prev, `[NETWORK] Handshaking with Manager (${API_URL})...`]);

      const res = await fetch(`${API_URL}/simulate/sample`);
      if (!res.ok) throw new Error(`Manager Error: ${res.statusText}`);
      
      const data = await res.json();
      
      await delay(600);
      setLogs(prev => [...prev, `[CONNECT] Unit #${data.unit_id} Identified`]);
      setLogs(prev => [...prev, `[STREAM] Ingesting 50-Cycle Sensor Sequence...`]);
      
      setGraphData(data.sequence);
      setSimulating(true);

    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, `[ERROR] Connection Failed: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. UPLOAD MODE ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      processUploadedData(text);
    };
    reader.readAsText(file);
  };

  const processUploadedData = async (text: string) => {
    setLoading(true);
    setResult(null);
    setSimulating(false);
    setLogs(["[SYSTEM] Reading File Buffer..."]);

    try {
      await delay(400);
      const rows = text.trim().split('\n').map(row => 
        row.trim().split(/\s+/).map(Number)
      );

      if (rows.length < 50) throw new Error(`File too short! Need 50+ cycles.`);

      const last50Rows = rows.slice(-50);
      const unitId = last50Rows[49][0]; 
      const cleanData = last50Rows.map(row => row.slice(2, 26));

      setLogs(prev => [...prev, `[PARSE] Extracted Sequence for Unit #${unitId}`]);
      setGraphData(cleanData);
      setSimulating(true);

    } catch (err: any) {
      console.error(err);
      setLogs(prev => [...prev, `[ERROR] Parse Failed: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  // --- SHARED: PREDICTION CALL ---
  const fetchPrediction = async () => {
    try {
      // Don't clear logs here, append to them
      const res = await fetch(`${API_URL}/predict/jet-engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: graphData })
      });
      
      const json = await res.json();
      if (!res.ok || json.detail) throw new Error(json.detail || "Server Error");

      setLogs(prev => [...prev, `[SUCCESS] Inference Complete`]);
      setLogs(prev => [...prev, `[MODEL] ${json.prediction.confidence}`]); // Show which model was used
      setResult(json);
      
    } catch (err: any) {
      console.error("Prediction Error:", err);
      setLogs(prev => [...prev, `[ERROR] AI Inference Failed`]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              AERO<span className="text-emerald-500">PROPHET</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Zero-Ops Diagnostics // Context-Aware AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setMode('sim')}
              className={`px-4 py-2 rounded text-sm font-medium transition ${mode === 'sim' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Simulation
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded text-sm font-medium transition ${mode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Upload Data
            </button>
          </div>
        </header>

        {/* CONTROLS */}
        <section className="flex justify-end">
          {mode === 'sim' ? (
            <button 
              onClick={startSimulation}
              disabled={loading || simulating}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center gap-2"
            >
              {loading ? 'INITIALIZING...' : simulating ? 'ANALYZING...' : 'RUN LIVE SIMULATION'}
            </button>
          ) : (
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.csv"
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || simulating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-900/20"
              >
                {loading ? 'PARSING...' : simulating ? 'ANALYZING...' : 'UPLOAD .TXT FILE'}
              </button>
            </div>
          )}
        </section>

        {/* MAIN GRID */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: VISUALS */}
          <div className="lg:col-span-2 space-y-6">
            {/* DIGITAL TWIN */}
            <div className="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/5 p-8 relative overflow-hidden min-h-[320px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-30"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-200">Digital Twin</h2>
                  <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Component Health Status</p>
                </div>
                {result?.prediction && (
                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                     result.prediction.risk_level === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                     result.prediction.risk_level === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
                     'bg-red-500/10 border-red-500/50 text-red-400'
                   }`}>
                     {result.prediction.risk_level} STATUS
                   </span>
                )}
              </div>
              
              <EngineSchematic healthScores={result?.component_health} />
            </div>

            {/* LIVE CHART */}
            <div className="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/5 p-8">
              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Live Telemetry (Sensor 4: LPT Temp)</h2>
              <div className="h-64 bg-black/20 rounded-xl border border-white/5">
                {graphData.length > 0 ? (
                  <LiveChart 
                    data={graphData} 
                    isPlaying={simulating} 
                    onComplete={fetchPrediction} 
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                    No Telemetry Data Available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: ANALYTICS (CINEMATIC LOGS) */}
          <div className="bg-slate-900/50 backdrop-blur rounded-3xl border border-white/5 p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-200 mb-6">Diagnostics Log</h2>
            
            <div className="flex-1 font-mono text-xs space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {/* DEFAULT LOG */}
              {logs.length === 0 && (
                 <div className="text-slate-600 border-l-2 border-slate-800 pl-3">
                   [SYSTEM] Ready for Input...
                 </div>
              )}

              {/* DYNAMIC LOGS */}
              {logs.map((log, i) => (
                <div key={i} className={`border-l-2 pl-3 ${
                    log.includes('ERROR') ? 'text-red-400 border-red-500' : 
                    log.includes('SUCCESS') ? 'text-emerald-400 border-emerald-500' :
                    log.includes('MODEL') ? 'text-blue-400 border-blue-500' :
                    'text-slate-400 border-slate-700'
                }`}>
                    {log}
                </div>
              ))}

              {/* RESULT CARD */}
              {result?.prediction && (
                <>
                  <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Predicted RUL</div>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {Math.floor(result.prediction.rul)} <span className="text-lg text-slate-500 font-medium">cycles</span>
                    </div>
                    <div className="mt-4 flex justify-between items-end border-t border-white/10 pt-4">
                      <div>
                         <div className="text-xs text-slate-500 uppercase">Volatility</div>
                         <div className="text-white font-mono">{result.prediction.system_volatility}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-slate-500 uppercase">Confidence</div>
                         <div className="text-white font-mono">{result.prediction.confidence}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="text-xs text-slate-500 uppercase tracking-widest">Component Analysis</h3>
                    {result.component_health && Object.entries(result.component_health).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center group">
                         <span className="capitalize text-slate-400 group-hover:text-white transition">{key}</span>
                         <div className="flex items-center gap-3">
                           <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full transition-all duration-1000 ${val > 80 ? 'bg-emerald-500' : val > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                               style={{ width: `${val}%` }}
                             ></div>
                           </div>
                           <span className={`w-8 text-right font-mono ${val > 80 ? 'text-emerald-400' : val > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                             {val}%
                           </span>
                         </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;