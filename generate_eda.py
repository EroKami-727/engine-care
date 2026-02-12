import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
from sklearn.preprocessing import MinMaxScaler, RobustScaler

# Configuration
DATA_DIR = 'data'
OUTPUT_DIR = os.path.join(DATA_DIR, 'eda_images')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Column Names
FEATURE_COLS = ['op_setting_1', 'op_setting_2', 'op_setting_3'] + [f'sensor_{i}' for i in range(1, 22)]
ALL_COLS = ['unit_number', 'time_in_cycles'] + FEATURE_COLS

DATASETS = {
    'FD001': 'train_FD001.txt',
    'FD002': 'train_FD002.txt',
    'FD003': 'train_FD003.txt',
    'FD004': 'train_FD004.txt'
}

def load_dataset(name, filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {name}: File not found at {filepath}")
        return None
    
    df = pd.read_csv(filepath, sep=r'\s+', header=None, names=ALL_COLS)
    
    # Calculate RUL
    max_cycles = df.groupby('unit_number')['time_in_cycles'].max().reset_index()
    max_cycles.columns = ['unit_number', 'max_life']
    df = df.merge(max_cycles, on='unit_number', how='left')
    df['RUL'] = df['max_life'] - df['time_in_cycles']
    
    return df

def plot_rul_distribution(dfs):
    plt.figure(figsize=(10, 6))
    for name, df in dfs.items():
        if df is None: continue
        # Get one value per unit (max_life)
        max_lives = df.groupby('unit_number')['max_life'].max()
        sns.kdeplot(max_lives, label=f'{name} (Mean: {max_lives.mean():.0f})', fill=True, alpha=0.1)
    
    plt.title('Distribution of Engine Lifespan (Cycles to Failure)')
    plt.xlabel('Total Cycles')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'rul_distribution.png'))
    plt.close()
    print("Generated RUL Distribution plot.")

def plot_correlation_matrix(df, name):
    if df is None: return
    
    # Calculate correlation
    cols_to_corr = ['RUL'] + FEATURE_COLS
    corr = df[cols_to_corr].corr()
    
    # Mask upper triangle
    mask = np.triu(np.ones_like(corr, dtype=bool))
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(corr, mask=mask, cmap='coolwarm', center=0, square=True, linewidths=.5, cbar_kws={"shrink": .5})
    plt.title(f'Feature Correlation with RUL - {name}')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'correlation_{name}.png'))
    plt.close()
    print(f"Generated Correlation Matrix for {name}.")

def plot_sensor_trends(df, name, unit_id=1):
    if df is None: return
    
    unit_data = df[df['unit_number'] == unit_id]
    
    # Select a few interesting sensors
    sensors = ['sensor_2', 'sensor_4', 'sensor_7', 'sensor_12']
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 8), sharex=True)
    fig.suptitle(f'Sensor Degradation Trends (Unit {unit_id} - {name})')
    
    for ax, sensor in zip(axes.flatten(), sensors):
        ax.plot(unit_data['time_in_cycles'], unit_data[sensor], color='tab:red')
        ax.set_title(sensor)
        ax.set_ylabel('Value')
        ax.grid(True, alpha=0.3)
        
    plt.xlabel('Time (Cycles)')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'sensor_trends_{name}.png'))
    plt.close()
    print(f"Generated Sensor Trends for {name}.")

def plot_normalization_effect(df, name):
    if df is None: return
    
    # Choose a sensor with variance
    sensor = 'sensor_4'
    data = df[sensor].values.reshape(-1, 1)
    
    # Apply Scalers
    minmax = MinMaxScaler().fit_transform(data)
    robust = RobustScaler().fit_transform(data)
    
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    
    # Raw
    sns.histplot(data, ax=axes[0], bins=50, color='gray')
    axes[0].set_title(f'Raw {sensor} ({name})')
    
    # MinMax
    sns.histplot(minmax, ax=axes[1], bins=50, color='blue')
    axes[1].set_title('MinMax Scaled (Range 0-1)')
    
    # Robust
    sns.histplot(robust, ax=axes[2], bins=50, color='green')
    axes[2].set_title('Robust Scaled (Outlier Resilient)')
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'normalization_effect.png'))
    plt.close()
    print("Generated Normalization Effect plot.")

def main():
    print("Loading datasets...")
    dfs = {name: load_dataset(name, fname) for name, fname in DATASETS.items()}
    
    # 1. RUL Distribution (All)
    plot_rul_distribution(dfs)
    
    # 2. Correlation Matrix (FD001 - Stable, FD004 - Complex)
    plot_correlation_matrix(dfs['FD001'], 'FD001')
    plot_correlation_matrix(dfs['FD004'], 'FD004')
    
    # 3. Sensor Trends (FD001 Unit 1)
    plot_sensor_trends(dfs['FD001'], 'FD001', unit_id=1)
    
    # 4. Normalization Effect (FD002 - Noisy/Multi-condition)
    plot_normalization_effect(dfs['FD002'], 'FD002')

    print("EDA Complete. Images saved to data/eda_images/")

if __name__ == '__main__':
    main()
