import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# 1. Load dataset
df = pd.read_csv("data/processed/heart_disease_processed.csv")

# 2. Split features & target
X = df.drop("target", axis=1)
y = df["target"]

# 3. Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Train model
model = XGBClassifier()
model.fit(X_scaled, y)

# 5. Save FULL pipeline
import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

model_dir = os.path.join(BASE_DIR, "models")

# Ensure folder exists
os.makedirs(model_dir, exist_ok=True)

model_path = os.path.join(model_dir, "full_pipeline.pkl")

joblib.dump({
    "model": model,
    "scaler": scaler
}, model_path)

print("✅ Model saved at:", model_path)

print("✅ Model + Scaler saved successfully")