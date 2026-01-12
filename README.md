# EngineCare

EngineCare is a predictive maintenance (PdM) platform designed to estimate the Remaining Useful Life (RUL) of turbofan engines. It leverages deep learning to analyze sensor data in real-time, providing actionable insights into engine health and component degradation.

The system is built on a "Zero-Ops" architecture, utilizing a specialized orchestration layer to manage inference resources dynamically. This ensures optimal resource usage by spinning up containerized workers only when analysis is required.

## System Architecture

The application follows a three-tier architecture designed for scalability and resource efficiency:

1.  **Frontend (Visualization Layer):**
    *   Built with **React, TypeScript, and Vite**.
    *   Provides an interactive dashboard for data upload, visualization, and reporting.
    *   Parses raw sensor data client-side before transmission to minimize bandwidth usage.

2.  **Manager (Orchestration Layer):**
    *   A lightweight **FastAPI** service.
    *   Acts as the central gateway and resource manager.
    *   Dynamically spawns **Docker** containers for inference tasks and terminates them after a period of inactivity to conserve system resources.

3.  **Worker (Inference Layer):**
    *   Ephemeral **Docker** containers running **TensorFlow/Keras**.
    *   Hosts the specialized LSTM models for RUL prediction.
    *   Performs regime detection to select the appropriate model (Steady-state vs. Complex operation) and calculates component-level health scores.

## Key Features

*   **Regime-Aware Prediction:** Automatically detects the engine's operating condition to select the most accurate pre-trained LSTM model.
*   **Component Diagnostics:** Analyzes specific sensor clusters to derive health scores for major components (Fan, LPC, HPC, etc.).
*   **Dynamic Resource Management:** Automatically scales inference workers to zero during idle periods.
*   **Interactive Visualization:** Displays engine health status through a dynamic schematic and detailed sensor charts.

## Technology Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts.
*   **Backend:** Python, FastAPI, Docker SDK.
*   **Machine Learning:** TensorFlow (Keras), Scikit-learn, Pandas, NumPy.
*   **Infrastructure:** Docker.

## Setup and Installation

### Prerequisites
*   Docker Engine installed and running.
*   Python 3.10+
*   Node.js 18+

### 1. Build the Worker Image
The inference logic must be packaged into a Docker image for the manager to utilize.

```bash
cd workers/jet-engine
docker build -t engine-care-worker .
```

### 2. Start the Backend Manager
Run the orchestration service.

```bash
cd backend
python manager.py
```
The service will start on port 8000.

### 3. Start the Frontend
Launch the web interface.

```bash
cd frontend
npm install
npm run dev
```
Access the dashboard at the provided local URL (typically `http://localhost:5173`).

### 4. Running a Test
Sample data files are provided in the `data/` directory. Upload `test_FD001.txt` via the web interface to trigger the diagnostic pipeline.
