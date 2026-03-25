# src/config/paths.py
from pathlib import Path

# Project root (wfa_xgb_cvd_prediction)
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# ---------------- Data ----------------
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

HEART_VERIFIED_CSV = PROCESSED_DATA_DIR / "heart_Verified.csv"
HEART_PROCESSED_CSV = PROCESSED_DATA_DIR / "heart_disease_processed.csv"

# ---------------- Experiments ----------------
EXPERIMENTS_DIR = PROJECT_ROOT / "notebooks" / "experiments"
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)

BASELINE_RESULTS_CSV = EXPERIMENTS_DIR / "baseline_results.csv"
WFA_FEATURE_WEIGHTS_CSV = EXPERIMENTS_DIR / "wfa_feature_weights.csv"
FEATURE_AUGMENTED_WEIGHTS_CSV = EXPERIMENTS_DIR / "feature_augmented_weights.csv"

# ---------------- Models ----------------
MODELS_DIR = PROJECT_ROOT / "models"
BASELINE_MODELS_DIR = MODELS_DIR / "baselines"
WFA_XGB_MODELS_DIR = MODELS_DIR / "wfa_xgb"

BASELINE_MODELS_DIR.mkdir(parents=True, exist_ok=True)
WFA_XGB_MODELS_DIR.mkdir(parents=True, exist_ok=True)

BASELINE_MODEL_PKL = BASELINE_MODELS_DIR / "baseline_models.pkl"
WFA_XGB_MODEL_JSON = WFA_XGB_MODELS_DIR / "wfa_xgb_model.json"

# ---------------- Reports ----------------
REPORTS_DIR = PROJECT_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"
TABLES_DIR = REPORTS_DIR / "tables"
