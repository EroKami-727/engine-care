import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib
import os

# --- PATH CONFIGURATION ---
# Get the folder where this script lives (backend/)
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up one level to Project Root
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Define paths relative to Root
DATA_PATH = os.path.join(PROJECT_ROOT, "data")
MODELS_PATH = os.path.join(PROJECT_ROOT, "models")
MODEL_FILE = os.path.join(MODELS_PATH, "engine_model.pkl")

TRAIN_FILE = "train_FD001.txt"

# Ensure models directory exists
os.makedirs(MODELS_PATH, exist_ok=True)

# NASA Column Names
index_names = ['unit_nr', 'time_cycles']
setting_names = ['setting_1', 'setting_2', 'setting_3']
sensor_names = [f's_{i}' for i in range(1, 22)] 
col_names = index_names + setting_names + sensor_names

def load_data(filename):
    path = os.path.join(DATA_PATH, filename)
    if not os.path.exists(path):
        print(f"ERROR: File not found at {path}")
        exit()
        
    print(f"Loading {path}...")
    df = pd.read_csv(path, sep=r'\s+', header=None, names=col_names)
    return df

def process_data(df):
    max_cycles = df.groupby('unit_nr')['time_cycles'].max().reset_index()
    max_cycles.columns = ['unit_nr', 'max']
    df = df.merge(max_cycles, on=['unit_nr'], how='left')
    df['RUL'] = df['max'] - df['time_cycles']
    df.drop(columns=['max'], inplace=True)
    return df

def main():
    print(f"--- Training Model ---")
    print(f"Saving to: {MODEL_FILE}")
    
    train_df = load_data(TRAIN_FILE)
    train_df = process_data(train_df)
    
    drop_labels = ['unit_nr', 'time_cycles', 'setting_3', 's_1', 's_5', 's_10', 's_16', 's_18', 's_19']
    
    X_train = train_df.drop(columns=['RUL'] + drop_labels)
    y_train = train_df['RUL']
    
    rf = RandomForestRegressor(n_estimators=100, max_depth=15, n_jobs=-1, random_state=42)
    rf.fit(X_train, y_train)
    
    print("Model Trained!")
    
    joblib.dump(rf, MODEL_FILE)
    print(f"SUCCESS: Brain saved to {MODEL_FILE}")

if __name__ == "__main__":
    main()