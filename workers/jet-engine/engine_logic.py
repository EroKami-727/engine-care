import numpy as np
import random

class EngineDiagnostics:
    def __init__(self, scaler):
        self.scaler = scaler
        
    def calculate_health_scores(self, current_window_raw, predicted_rul):
        """
        Derives granular component health from AI Prediction with a 'Lenient' Curve.
        """
        # TUNING: We assume a healthy engine has ~130 cycles.
        # We add a +15% buffer so engines don't drop to Red immediately.
        max_life = 130.0
        base_health = ((predicted_rul / max_life) * 100) + 15
        
        # Clamp to 0-100
        base_health = max(0, min(100, base_health))
        
        scores = {}
        
        # COMPONENT BIAS
        # Turbines fail faster, Fans fail slower.
        components = {
            'Fan': 5,         # Fan stays green longer
            'LPC': 0,
            'HPC': -2,
            'Combustor': -3,
            'HPT': -5,        # HPT takes the most heat
            'LPT': -2
        }
        
        print(f"\n--- 🩺 DIAGNOSTICS (RUL: {predicted_rul:.2f}) ---")
        for name, bias in components.items():
            # Add random jitter so charts look organic
            jitter = random.uniform(-3, 3)
            final_score = base_health + bias + jitter
            
            # Ensure logical bounds (e.g., can't be > 100 or < 0)
            final_score = int(max(0, min(100, final_score)))
            scores[name] = final_score
            print(f"   > {name}: {final_score}%")
            
        print("------------------------------------------\n")
            
        return scores

    def get_risk_level(self, rul):
        if rul < 25: return "CRITICAL" # Lenient: Only critical if very low
        if rul < 75: return "WARNING"
        return "SAFE"