from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd
import joblib
import io
import os

app = FastAPI(title="Aero-Prophet API")

# --- PATH CONFIGURATION ---
# Get backend folder
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# Get models folder (Sibling to backend)
MODELS_DIR = os.path.join(os.path.dirname(BACKEND_DIR), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "engine_model.pkl")

# Same column names as training
index_names = ['unit_nr', 'time_cycles']
setting_names = ['setting_1', 'setting_2', 'setting_3']
sensor_names = [f's_{i}' for i in range(1, 22)] 
col_names = index_names + setting_names + sensor_names

# Columns to drop
drop_labels = ['unit_nr', 'time_cycles', 'setting_3', 's_1', 's_5', 's_10', 's_16', 's_18', 's_19']

# Load the Brain
print(f"Looking for model at: {MODEL_PATH}")
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("Model Loaded Successfully!")
else:
    print("ERROR: Model not found. Please run train_model.py")
    model = None

@app.get("/")
def home():
    return {"status": "online"}

@app.post("/predict")
async def predict_engine(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')), sep=r'\s+', header=None, names=col_names)
        
        # Get last row
        current_state = df.iloc[[-1]].copy()
        current_cycle = int(current_state['time_cycles'].values[0])
        engine_id = int(current_state['unit_nr'].values[0])
        
        # Predict
        features = current_state.drop(columns=drop_labels)
        prediction = model.predict(features)
        
        return {
            "engine_id": engine_id,
            "current_cycle": current_cycle,
            "predicted_RUL": int(prediction[0]),
            "msg": "Success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)