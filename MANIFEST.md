# System Design Specification: EngineCare

**Project:** EngineCare (Predictive Maintenance Platform)
**Version:** 2.0
**Domain:** Industrial IoT / Aerospace

## 1. Project Overview

EngineCare is a full-stack predictive maintenance (PdM) solution designed for high-value industrial assets, specifically turbofan engines. The system aims to replace traditional "run-to-failure" or schedule-based maintenance strategies with data-driven "condition-based" maintenance.

The core objective is to accurately estimate the Remaining Useful Life (RUL) of an engine using deep learning, while providing granular insights into the health of individual subsystems (Fan, Compressor, Turbine).

## 2. Architectural Design

The system implements a **Three-Tier Architecture** focused on resource efficiency and modularity.

### 2.1. The "Zero-Ops" Orchestrator (Backend)
*   **Role:** Acts as a lightweight gateway and resource manager.
*   **Implementation:** Python (FastAPI) + Docker SDK.
*   **Behavior:**
    *   Maintains a low footprint (~20MB RAM) when idle.
    *   Interceps incoming prediction requests.
    *   **Cold Start:** Dynamically provisions a Docker container for the inference worker if one is not active.
    *   **Scale-to-Zero:** Monitors container activity and terminates instances after a configurable timeout (default: 300s).

### 2.2. The Inference Engine (Worker)
*   **Role:** Performs heavy computation, signal processing, and AI inference.
*   **Implementation:** TensorFlow/Keras within a Docker container.
*   **Regime-Aware Logic:**
    *   Analyzes input sensor data to detect the operating regime (Steady-State vs. High-Load/Complex).
    *   Dynamically routes data to the appropriate specialized LSTM model (`model_regime_A` or `model_regime_B`).

### 2.3. The Interactive Dashboard (Frontend)
*   **Role:** User interface for engineers and maintenance personnel.
*   **Implementation:** React, TypeScript, Vite.
*   **Key Capabilities:**
    *   **Client-Side Parsing:** Pre-processes raw CMAPSS data files to reduce payload size.
    *   **Visual Twin:** Renders a schematic representation of the engine, mapping health scores to color-coded visual indicators on the blueprint.
    *   **Offline Simulation:** Includes a mock data generator to enable feature demonstration in the absence of backend connectivity.

## 3. Data Science Pipeline

The analytical core utilizes the NASA C-MAPSS (Commercial Modular Aero-Propulsion System Simulation) dataset.

### 3.1. RUL Estimation
*   **Model Architecture:** Long Short-Term Memory (LSTM) networks.
*   **Input Window:** 50-cycle lookback period.
*   **Output:** Continuous variable representing the predicted Remaining Useful Life (cycles).

### 3.2. Health Index Derivation
Beyond a single RUL number, the system calculates granular health metrics for key components by analyzing specific sensor clusters:
*   **Fan Module:** Correlated with Inlet Temperature/Pressure sensors.
*   **High-Pressure Compressor (HPC):** Derived from Outlet Temperature/Pressure deviations.
*   **Combustor:** Analyzed via Fuel-Air Ratio and Bypass metrics.
*   **Turbines (LPT/HPT):** Monitored via downstream Exhaust Gas Temperature (EGT) profiles.

## 4. Technical Roadmap

### Current Status
*   [x] Core LSTM Inference Pipeline
*   [x] Dynamic Docker Orchestration
*   [x] Regime Detection Algorithm
*   [x] React/Vite Dashboard Implementation
*   [x] Component-Level Health Visualization

### Future Enhancements
*   **Uncertainty Quantification:** Implement Monte Carlo Dropout to provide confidence intervals for RUL predictions.
*   **Fleet Management:** Extend the data model to track multiple engines over time.
*   **Edge Deployment:** Optimize worker images for deployment on edge devices (e.g., Jetson Nano) for on-wing analysis.
