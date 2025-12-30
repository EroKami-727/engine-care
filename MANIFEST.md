# PROJECT MANIFEST: EngineCare (Aero-Prophet)

**Role:** Senior Full-Stack & Data Science Portfolio Project
**Objective:** Predictive Maintenance (PdM) Dashboard for NASA Turbofan Engines.
**Core Philosophy:** "Zero-Ops" (Serverless on Localhost) with Graceful Degradation.

### Reference Links
*   **GitHub Repository:** [https://github.com/EroKami-727/engine-care](https://github.com/EroKami-727/engine-care)
*   **Dataset (NASA C-MAPSS):** [NASA PCoE Data Set Repository (Dataset #6)](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/)

---

## 1. DATA SCIENCE PIPELINE ("The Brain")
**Goal:** Move from simple Regression to rich, interpretable Diagnostics.

### A. Algorithm Upgrade
*   **Transition to LSTM (Long Short-Term Memory):** Move away from Random Forest. The model must handle time-series "windows" (e.g., last 50 cycles) to understand degradation trends, not just instantaneous values.
*   **Uncertainty Quantification:** The model will output a **Predicted RUL** *and* a **Confidence Score** (e.g., "75 cycles left, with 85% confidence").
    *   *Method:* Use Dropout at inference time (Monte Carlo Dropout) or Quantile Regression to estimate variance.

### B. Derived Metrics (Beyond RUL)
We will extract maximum metadata from the C-MAPSS dataset to populate the UI.
1.  **Component Health Scores (0-100%):** Calculated via Z-Score deviation from the baseline (Cycle 0-10) for specific sensors.
2.  **Current Risk Level:** Categorical status based on RUL and Rate of Change (Safe, Warning, Critical).
3.  **Degradation Velocity:** Is the engine failing slowly (linear) or rapidly (exponential)? Calculated via the slope of the last 10 data points.

### C. Advanced Sensor-to-Component Mapping (For SVG)
To be used for coloring the blueprint parts:
*   **Fan Module:** Sensors 1, 2 (Inlet Temp/Pres), 5 (Pressure).
*   **Low-Pressure Compressor (LPC):** Derived from correlation (or specific subset if available).
*   **High-Pressure Compressor (HPC):** Sensors 3, 7 (Outlet Temp/Pres), 17.
*   **Combustor (Burner):** Sensor 12 (Ratio), 14, 15 (Bypass/Bleed).
*   **Low-Pressure Turbine (LPT):** Sensor 4 (Outlet Temp), 18.
*   **High-Pressure Turbine (HPT):** Sensor 21.

---

## 2. FRONTEND VISUALIZATION ("The Wow Factor")
**Stack:** React + Vite + Recharts + Vanilla CSS (Glassmorphism).

### A. Interactive SVG Digital Twin
*   **Structure:** A 2D "Cutaway" technical illustration of a generic Turbofan engine.
*   **Dynamic Styling:** SVG groups (`<g id="fan">`) will bind to the **Component Health Scores**.
    *   *Visuals:* Color shift (Green -> Yellow -> Red) + CSS Glow/Pulse animations for "Critical" components.
*   **Interactivity:** Hovering over an engine part displays a tooltip with that specific component's raw sensor metrics (e.g., "Fan Speed: 2388 rpm").

### B. "Time-Travel" Simulation (Video Mode)
*   **Logic:** The API returns the *entire* relevant history of the engine (e.g., Cycle 0 to Current).
*   **Rendering:** The Frontend does not render the graph instantly.
*   **Adaptive Interval:**
    *   Target Duration: ~4 seconds.
    *   Math: `Interval_ms = 4000 / Total_History_Points`.
    *   Result: Whether the engine has 50 cycles or 200 cycles of history, the "playback" animation always takes ~4 seconds to draw, creating a consistent "cinematic" feel.

### C. Graceful Degradation (Offline Portfolio Mode)
**Problem:** Local laptop server is offline/sleeping.
**Solution:**
1.  **Request:** Frontend attempts to hit Ngrok/Localhost.
2.  **Failure:** Request times out or returns 404/500.
3.  **Interaction:**
    *   UI catches error.
    *   **Modal Pop-up:** "Server Connection Failed (Engine Offline). Would you like to run a Simulation?"
    *   **Action:** If user clicks "Yes", load a pre-saved `mock_response.json` (captured from a real successful run).
    *   **UI Indicator:** Display a "DEMO MODE" badge in the corner so users know this is simulated.

---

## 3. BACKEND ARCHITECTURE ("The Scalable Skeleton")
**Stack:** Python FastAPI (Manager) + Docker (Worker).

### A. The "Manager" (Router Pattern)
*   Refactor `manager.py` to remove hardcoded jet-engine logic.
*   **Endpoint Design:**
    *   `POST /predict/{model_type}` (e.g., `jet-engine`, `wind-turbine`).
*   **Dynamic Container Management:**
    *   The manager looks up `model_type` in a config dictionary.
    *   Dictionary maps `jet-engine` -> `image: engine-care-worker:latest`.
    *   This ensures we can add Wind Turbines later without rewriting the proxy logic.

### B. API Response Structure
The new JSON response from the worker must include the rich data:
```json
{
  "prediction": {
    "rul": 45,
    "confidence_score": 0.88,
    "risk_level": "Warning"
  },
  "health_scores": {
    "fan": 98,
    "hpc": 72,
    "lpt": 85,
    "combustor": 92
  },
  "history_trace": [ ...array of sensor values for the graph video... ]
}
```

## 4. IMMEDIATE EXECUTION ORDER

1. **Refactor Backend Folders: Create workers/jet-engine/ and move Docker/Model logic there.**

2. **Data Science Implementation: Write the LSTM training script + The "Health Score" extractor logic.**

3. **API Update: Update FastAPI to return the new JSON structure.**

4. **Frontend "Offline Mode": Implement the try-catch fallback mechanism first (easier debugging).**

5. **Frontend Visuals: Build the Graph playback and SVG Blueprint integration.**