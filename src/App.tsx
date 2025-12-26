import { useState } from 'react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // PASTE YOUR CLOUDFLARE LINK HERE (No trailing slash!)
  const API_URL = "https://opal-nontransmittible-kyla.ngrok-free.dev"; 

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Send to your Laptop (via Cloudflare)
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      // 2. Get the Result
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to server. Is the Manager running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", fontFamily: "Arial" }}>
      <h1>Aero-Prophet: Engine Analytics</h1>
      
      <div style={{ border: "2px dashed #ccc", padding: "20px", width: "300px" }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
        />
        <br /><br />
        <button onClick={handleUpload} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Analyzing Engine..." : "Run Diagnostics"}
        </button>
      </div>

      {loading && <p>⚡ Waking up Zero-Ops Container... (This takes ~5s)</p>}

      {result && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f0f0f0", borderRadius: "10px" }}>
          <h2>Diagnosis Complete</h2>
          <p><strong>Engine ID:</strong> {result.engine_id}</p>
          <p><strong>Current Cycle:</strong> {result.current_cycle}</p>
          <h3 style={{ color: result.predicted_RUL < 20 ? "red" : "green" }}>
            Predicted RUL: {result.predicted_RUL} Cycles
          </h3>
          <p><em>{result.prediction_message}</em></p>
        </div>
      )}
    </div>
  );
}

export default App;