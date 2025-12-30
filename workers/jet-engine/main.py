import os
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from engine_logic import EngineDiagnostics

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSET_DIR = os.path.join(BASE_DIR, "model_assets")

# --- LOAD MODELS ---
print("⚙️ [INIT] Loading Models...")
try:
    model_A = tf.keras.models.load_model(os.path.join(ASSET_DIR, "model_regime_A.keras"))
    scaler_A = joblib.load(os.path.join(ASSET_DIR, "scaler_regime_A.pkl"))
    print("✅ Regime A (Steady) Loaded.")
except Exception as e:
    print(f"❌ Failed to load Regime A: {e}")
    model_A = None

try:
    model_B = tf.keras.models.load_model(os.path.join(ASSET_DIR, "model_regime_B.keras"))
    scaler_B = joblib.load(os.path.join(ASSET_DIR, "scaler_regime_B.pkl"))
    print("✅ Regime B (Complex) Loaded.")
except Exception as e:
    print(f"❌ Failed to load Regime B: {e}")
    model_B = None

diagnostics = EngineDiagnostics(None)

class SequenceInput(BaseModel):
    data: List[List[float]] 

def detect_regime(raw_sequence):
    """
    Robust Detection using Range (Max - Min).
    FD001 Op1 Range is < 0.01
    FD002 Op1 Range is > 20.0
    """
    df = pd.DataFrame(raw_sequence)
    
    # DEBUG: Print first row to ensure Column 0 is actually Op Setting 1
    first_row = df.iloc[0].tolist()
    print(f"👀 DATA DEBUG (First Row): {first_row[:5]}...") 
    
    # Calculate Range of Column 0
    op_min = df[0].min()
    op_max = df[0].max()
    op_range = op_max - op_min
    
    print(f"🔍 DETECTED RANGE: {op_range:.4f}") 
    
    # Threshold: 5.0 is a massive safety margin. 
    # FD001 will never exceed 0.01. FD002 is always > 20.
    if op_range > 5.0:
        return "B"
    else:
        return "A"

@app.post("/predict")
def predict_rul(payload: SequenceInput):
    raw_sequence = np.array(payload.data)
    
    # 1. DETECT REGIME
    regime = detect_regime(raw_sequence)
    
    # 2. SELECT MODEL
    if regime == "A":
        if not model_A: raise HTTPException(500, "Model A missing")
        selected_model = model_A
        selected_scaler = scaler_A
        model_name = "Model A (Steady State)"
    else:
        if not model_B: raise HTTPException(500, "Model B missing")
        selected_model = model_B
        selected_scaler = scaler_B
        model_name = "Model B (Complex)"

    # 3. PREPROCESS & PREDICT
    try:
        scaled_df = pd.DataFrame(selected_scaler.transform(raw_sequence), columns=selected_scaler.feature_names_in_)
        scaled_tensor = scaled_df.values.reshape(1, 50, -1)
        prediction = selected_model.predict(scaled_tensor)
        rul = float(prediction[0][0])
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        raise HTTPException(status_code=400, detail=f"Error: {e}")

    # 4. DIAGNOSTICS
    volatility = pd.DataFrame(raw_sequence).std().mean()
    health_scores = diagnostics.calculate_health_scores(None, rul)
    risk_level = diagnostics.get_risk_level(rul)

    print(f"✅ Prediction: {rul} cycles | Model: {regime}")

    return {
        "prediction": {
            "rul": round(rul, 2),
            "risk_level": risk_level,
            "confidence": f"High (Using {model_name})",
            "system_volatility": round(volatility, 4)
        },
        "component_health": health_scores,
        "system_status": "Nominal" if risk_level == "SAFE" else "Degraded"
    }