# Project Documentation: Turbofan Engine Degradation Simulation (C-MAPSS)

## Introduction

This project focuses on **Predictive Maintenance (PdM)**, specifically the prediction of **Remaining Useful Life (RUL)** for turbofan engines. By analyzing sensor data simulated by NASA, we aim to predict how many operational cycles an engine has left before it fails. This capability is critical in aerospace to prevent catastrophic failures, optimize maintenance schedules, and reduce operational costs.

The following sections detail the end-to-end pipeline, from raw data ingestion to model evaluation.

---

## Section 1: Data Collection

The dataset utilized in this project is the **Commercial Modular Aero-Propulsion System Simulation (C-MAPSS)** dataset, provided by the NASA Prognostics Center of Excellence (PCoE). This dataset consists of time-series data simulating an engine degrading under various operating conditions and fault modes.

We are working with four distinct subsets:

*   **FD001:** Simulates a single operating condition (Sea Level) and one fault mode (HPC Degradation). It is the simplest subset.
*   **FD002:** Introduces six operating conditions and maintains the single fault mode, significantly increasing complexity.
*   **FD003:** Returns to a single operating condition but introduces two fault modes (HPC Degradation and Fan Degradation).
*   **FD004:** The most complex subset, featuring all six operating conditions and both fault modes.

Each subset is divided into **Training** and **Test** sets. The training data contains run-to-failure trajectories (the engine runs until it breaks). The test data contains trajectories that stop at a random point prior to failure; our goal is to predict the RUL for these truncated sequences. The ground truth RUL for the test units is provided in separate text files (`RUL_FD00x.txt`).

The raw data files are space-separated text files provided without headers. They contain 26 columns:

1.  **Unit Number:** The specific engine ID.
2.  **Time Cycles:** The operational counter (1, 2, 3...).
3.  **Operational Settings (3 columns):** Altitude, Mach Number, and Throttle Resolver Angle (TRA).
4.  **Sensor Readings (21 columns):** Thermodynamics and mechanical parameters (Temperatures, Pressures, Speeds) labeled `s1` through `s21`.

---

## Section 2: Data Cleaning & Missing Value Treatment

Before analysis could begin, the raw data required structural organization. Since the source files lacked headers, we explicitly assigned column names to the 26 columns (`unit_nr`, `time_cycles`, `setting_1`... `setting_3`, `s1`... `s21`) to ensure readability and consistency across the pipeline.

We performed a rigorous check for data quality. Fortunately, the C-MAPSS dataset is high-quality synthetic data, meaning it does not contain **NaN (Null)** values. If missing values had been present, forward-filling (propagating the last valid observation) would have been the preferred strategy to maintain the temporal integrity of the time series.

A critical step in cleaning was the **identification of low-variance features**. In specific subsets (particularly FD001 and FD003), certain sensors record constant or near-constant values because the operating conditions remain stable. For example, sensors like *Total Temperature at fan inlet (s1)* often have a standard deviation of 0.0. These features provide no information to the model and can introduce noise. We identified these sensors by calculating the standard deviation across the training set; any sensor with zero or negligible variance was dropped from the dataset to reduce dimensionality and improve training efficiency.

---

## Section 3: Normalization & Parameter Identification

The sensors in a turbofan engine operate on vastly different physical scales. For instance, Physical Fan Speed (`Nf`) might operate in the thousands of RPM, while Bypass Ratio (`BPR`) might range between small singular digits. If fed directly into a machine learning model, the larger values would dominate the calculated gradients, preventing the model from learning effectively.

To resolve this, we applied **Min-Max Normalization (scaling)**. This technique transforms all features to a range between 0 and 1 (or -1 to 1). We fit the scaler **only on the training data** and then applied that same transformation to the test data. This prevents "data leakage," ensuring our model doesn't "see" the range of the test data during training.

### Target Engineering (RUL)

The dataset does not explicitly provide a "Target" column for the training set; it provides run-to-failure cycles. We engineered the target variable, RUL, by calculating the maximum cycle life of a specific unit and subtracting the current cycle number:

$$ RUL(t) = \text{MaxCycles} - \text{CurrentCycle}(t) $$

However, engines generally operate "healthily" for a long period before degradation becomes visible. Assigning a linear RUL from the very first cycle creates a difficult mapping for the model (predicting degradation when none exists). To address this, we employed **Piecewise Linear RUL (rectified RUL)**.

We capped the maximum RUL at a specific threshold (e.g., 125 cycles). This means any RUL greater than 125 is treated as 125. This teaches the model to predict "The engine is healthy" (constant value) until the degradation phase actually begins.

---

## Section 4: EDA, Target Definition & Correlation Analysis

We conducted Exploratory Data Analysis (EDA) to understand the physical behavior of the engines. We plotted the life-cycle length distribution, observing that while most engines fail around the average cycle count, some fail significantly earlier or later, highlighting the stochastic nature of the problem.

We visualized individual sensor trends over time. In the run-to-failure plots, clear trends emerged:

*   **Monotonic Trends:** Sensors like HPC Outlet Temperature (`s11`) and HPC Outlet Pressure (`s4`) show a distinct upward or downward trajectory as the engine degrades.
*   **Noise:** Some sensors fluctuated heavily, while others (dropped in Section 2) remained flat.

To quantify these relationships, we computed a **Correlation Matrix** using the Pearson Correlation Coefficient. This analysis revealed:

*   **Correlation with RUL:** We identified which sensors had the strongest negative or positive correlation with the engineered RUL variable. These are our most predictive features.
*   **Multicollinearity:** Many sensors (e.g., different temperature readings) are highly correlated with each other. While redundant, deep learning models (like LSTMs) can often handle this, but understanding it helps in interpreting model focus.

The "Target" is strictly defined as the **Remaining Useful Life**. It is a regression problem where we attempt to minimize the difference between the predicted number of remaining cycles and the actual remaining cycles.

---

## Section 5: Model Building & Evaluation

For the modeling phase, we utilized Python with libraries such as Pandas for manipulation, Scikit-Learn for preprocessing, and deep learning frameworks (e.g., TensorFlow/Keras or PyTorch).

### Data Structure: Sliding Windows

Unlike standard regression where one row equals one prediction, time-series forecasting requires historical context. We structured the input data using a **Sliding Window (or "Time Lag")** approach.

*   We created 3D arrays of shape `(Samples, Window_Size, Features)`.
*   For example, with a window size of 30, the model looks at the last 30 cycles of sensor data to predict the RUL at the current cycle. This captures the rate of change and the velocity of degradation.

### Model Architecture

We implemented models capable of handling sequential data, such as **Long Short-Term Memory (LSTM)** networks or **Convolutional Neural Networks (CNN)** for time series. These architectures are ideal because they possess "memory"—they understand that the engine's state at cycle $t$ is dependent on what happened at $t-1$.

*   *Baseline:* We may have compared this against simpler regressors (Random Forest) to prove the necessity of the deep learning approach.

### Validation and Metrics

We evaluated the model on the unseen Test set using two primary metrics standard in the PHM (Prognostics and Health Management) domain:

1.  **RMSE (Root Mean Squared Error):** Measures the standard magnitude of error. It penalizes large errors heavily.
2.  **PHM Scoring Function (Asymmetric Score):** This is a specialized metric for maintenance. It penalizes **late predictions** (predicting the engine has 20 days left when it actually has 5) much more severely than early predictions. In aviation, a late prediction causes a crash, while an early prediction only causes premature maintenance.

Our final model aims to balance a low RMSE with a low PHM Score, ensuring safety and accuracy.

---

## Summary

This project demonstrates a full data science lifecycle: cleaning raw industrial sensor data, engineering meaningful features based on domain knowledge (Piecewise RUL), analyzing physical correlations, and deploying advanced sequence models to solve a critical safety problem in aerospace engineering.