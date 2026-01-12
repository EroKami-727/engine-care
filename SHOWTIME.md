# Demonstration Procedure

This document outlines the standard procedure for presenting the EngineCare platform. It covers environment preparation, service initialization, and the demonstration workflow.

## 1. Environment Preparation

Ensure the following pre-requisites are met before starting the demonstration:

*   **Docker Daemon:** Running and accessible.
*   **Worker Image:** The inference container image must be built.
    ```bash
    cd workers/jet-engine
    docker build -t engine-care-worker .
    ```

## 2. Service Initialization

Open three terminal windows to manage the services and monitor the system state.

### Terminal A: Backend Manager (Orchestrator)
This service manages the lifecycle of the inference workers.

```bash
# Activate your Python virtual environment if applicable
# source venv/bin/activate

cd backend
python manager.py
```
*Expected Output:* The manager logs startup information and listens on port 8000.

### Terminal B: Frontend (Dashboard)
This serves the user interface.

```bash
cd frontend
npm run dev
```
*Expected Output:* Vite server starts, typically at `http://localhost:5173`.

### Terminal C: System Monitor (Docker Watch)
Use this terminal to visually demonstrate the dynamic scaling of resources.

```bash
watch docker ps
```
*Expected Output:* Initially empty (no worker containers running).

## 3. Demonstration Workflow

### Step 1: Zero-Ops State
*   **Action:** Show Terminal C.
*   **Narrative:** "The system is currently in a 'Zero-Ops' state. No heavy inference resources are active, ensuring zero idle cost."

### Step 2: Diagnostic Request
*   **Action:** Open the web dashboard (`http://localhost:5173`).
*   **Action:** Click **"Run Diagnostics"** and upload a test file (e.g., `data/test_FD001.txt`).
*   **Observation:**
    *   **Terminal A:** Shows the manager receiving the request and initiating a "Cold Start".
    *   **Terminal C:** A new container (`engine-worker`) appears instantly.
    *   **Dashboard:** Displays the processing status.

### Step 3: Analysis & Visualization
*   **Action:** Walk through the results on the dashboard.
    *   **RUL Prediction:** Point out the estimated remaining useful life.
    *   **Regime Detection:** Highlight which model (Steady vs. Complex) was selected.
    *   **Component Health:** Hover over the engine schematic to show specific component scores (Fan, HPC, etc.).

### Step 4: Scale Down
*   **Action:** Return to Terminal C.
*   **Narrative:** "After the analysis is complete and a period of inactivity passes (default: 5 minutes), the manager automatically terminates the worker."
*   **Observation:** The container disappears from the `docker ps` list.

---

## Appendix: Remote Access (Optional)
If presenting from a mobile device or external network, use **ngrok** to tunnel the backend.

1.  Start ngrok pointing to the backend port:
    ```bash
    ngrok http 8000
    ```
2.  Update the frontend configuration (`frontend/.env` or equivalent) to point to the generated ngrok URL before building/serving.