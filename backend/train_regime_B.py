import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import RobustScaler
import joblib
import glob
import os

# --- CONFIG FOR REGIME B (Complex) ---
# FD002 and FD004
DATA_FILES = ['../data/train_FD002.txt', '../data/train_FD004.txt']
WORKER_ASSET_PATH = '../workers/jet-engine/model_assets'
MODEL_SAVE_PATH = os.path.join(WORKER_ASSET_PATH, 'model_regime_B.keras')
SCALER_SAVE_PATH = os.path.join(WORKER_ASSET_PATH, 'scaler_regime_B.pkl')

FEATURE_COLS = ['op_setting_1', 'op_setting_2', 'op_setting_3'] + [f'sensor_{i}' for i in range(1, 22)]
ALL_COLS = ['unit_number', 'time_in_cycles'] + FEATURE_COLS
SEQUENCE_LENGTH = 50

def ensure_dirs():
    if not os.path.exists(WORKER_ASSET_PATH): os.makedirs(WORKER_ASSET_PATH)

def load_data():
    print("🚀 [REGIME B] Loading Volatile Datasets (FD002 + FD004)...")
    all_dfs = []
    for filepath in DATA_FILES:
        if not os.path.exists(filepath): continue
        df = pd.read_csv(filepath, sep=r'\s+', header=None, names=ALL_COLS)
        
        max_cycles = df.groupby('unit_number')['time_in_cycles'].max().reset_index()
        max_cycles.columns = ['unit_number', 'max_life']
        df = df.merge(max_cycles, on='unit_number', how='left')
        df['RUL'] = df['max_life'] - df['time_in_cycles']
        df['RUL'] = df['RUL'].clip(upper=135) # Slightly higher for complex engines
        
        df['unit_number'] = df['unit_number'].apply(lambda x: f"{os.path.basename(filepath)}_{x}")
        all_dfs.append(df)
    return pd.concat(all_dfs, ignore_index=True)

def create_sequences(df):
    X_seq, y_seq = [], []
    for _, group in df.groupby('unit_number'):
        data_array = group[FEATURE_COLS].values
        target_array = group['RUL'].values
        if len(data_array) < SEQUENCE_LENGTH: continue
        for i in range(len(data_array) - SEQUENCE_LENGTH):
            X_seq.append(data_array[i : i + SEQUENCE_LENGTH])
            y_seq.append(target_array[i + SEQUENCE_LENGTH - 1])
    return np.array(X_seq, dtype=np.float32), np.array(y_seq, dtype=np.float32)

def build_model(input_shape):
    inputs = keras.Input(shape=input_shape)
    # Deeper / Wider Attention for Complex Patterns
    x = layers.MultiHeadAttention(key_dim=256, num_heads=8, dropout=0.2)(inputs, inputs)
    x = layers.LayerNormalization(epsilon=1e-6)(x + inputs)
    
    res = x
    # More Filters
    x = layers.Conv1D(filters=256, kernel_size=1, activation="relu")(x)
    x = layers.Dropout(0.2)(x) # Higher dropout for noise
    x = layers.Conv1D(filters=input_shape[-1], kernel_size=1)(x)
    x = layers.LayerNormalization(epsilon=1e-6)(x + res)
    
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dense(64, activation="relu")(x)
    outputs = layers.Dense(1)(x)
    return keras.Model(inputs, outputs)

def train():
    ensure_dirs()
    df = load_data()
    
    # RobustScaler is CRITICAL for FD002/004 to ignore throttle spikes
    scaler = RobustScaler()
    df[FEATURE_COLS] = scaler.fit_transform(df[FEATURE_COLS])
    joblib.dump(scaler, SCALER_SAVE_PATH)
    
    X, y = create_sequences(df)
    model = build_model((SEQUENCE_LENGTH, len(FEATURE_COLS)))
    model.compile(optimizer=keras.optimizers.Adam(1e-4), loss="mse", metrics=["mae"])
    
    early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=20, restore_best_weights=True)
    checkpoint = keras.callbacks.ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_loss', save_best_only=True)
    
    model.fit(X, y, epochs=150, batch_size=128, validation_split=0.15, callbacks=[early_stop, checkpoint], verbose=1)
    print("✅ Regime B Model Saved.")

if __name__ == "__main__":
    train()