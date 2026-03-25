# 🫀 WFA‑XGB CVD Prediction

> **A research‑grade, end‑to‑end machine learning pipeline** for **Weighted Feature Augmented (WFA) XGBoost**–based prediction of cardiovascular disease (CVD), with advanced feature engineering, SHAP explainability, and experiment tracking.

---

## ✨ Why This Project?
Cardiovascular disease remains one of the leading causes of mortality worldwide. This project explores a **novel WFA‑XGB modeling strategy** that enhances predictive performance by:

- Augmenting features using statistical & SHAP‑driven signals
- Applying focal loss to handle class imbalance
- Integrating explainability for clinical interpretability
- Maintaining full reproducibility and experiment traceability

---

## 🚀 Key Features

- 🔁 **End‑to‑End ML Pipeline**  
  Data loading → splitting → feature engineering → training → evaluation

- 📊 **Baseline Models**  
  Logistic Regression, Random Forest, and tuned XGBoost baselines

- 🧠 **WFA‑XGB Model**  
  Custom Weighted Feature Augmented XGBoost with focal loss support

- 🔍 **Explainability (SHAP)**  
  Global & local SHAP values, feature importance, augmented weights

- 🧪 **Experiment Tracking**  
  CSV‑based logging of ablations, MI scores, and SHAP summaries

- 🌐 **Deployment‑Ready Skeleton**  
  API entrypoint, deployment utilities, inference stubs

- ♻️ **Reproducibility**  
  Centralized configs, path management, seeded randomness

---

## 🛠️ Tech Stack

- **Language**: 🐍 Python 3.10+  
- **ML & Data**:  
  `numpy`, `pandas`, `scikit‑learn`, `xgboost`, `shap`, `joblib`, `matplotlib`

- **Experimentation**: 📓 Jupyter Notebooks  
- **API / Deployment**:  
  `app/api.py`, `src/deployment/`

- **Tooling**:  
  `pip`, Git, GitHub

---

## 📂 Project Structure

```text
wfa_xgb_cvd_prediction/
├── app/                     # API entrypoint
│   └── api.py
├── data/                    # Datasets
│   ├── feature_metadata.json
│   └── processed/
│       ├── heart_disease_processed.csv
│       └── heart_Verified.csv
├── experiments/             # Experiment outputs
├── models/                  # Trained model artifacts
├── notebooks/               # Research notebooks
├── reports/                 # Figures & tables
├── src/                     # Core ML source code
│   ├── config/
│   ├── data/
│   ├── features/
│   ├── models/
│   ├── evaluation/
│   ├── explainability/
│   ├── training/
│   └── utils/
├── tests/                   # Unit tests
├── requirements.txt
├── LICENSE
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites
- Python 3.10+ (3.11 recommended)
- Git
- (Optional) virtualenv / conda

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/Dhanumjay-Suragani/WFA_XGB_CVD.git
cd wfa_xgb_cvd_prediction
```

---

### 3️⃣ Create & Activate Virtual Environment

```bash
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

---

### 4️⃣ Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

No mandatory environment variables are hard‑coded.

**Recommended for production:**

```env
WFA_ENV=dev
WFA_LOG_LEVEL=INFO
WFA_DATA_ROOT=./data
```

Create a `.env` file locally (not committed).

---

## ▶️ Run the Project

### 📓 Run Notebooks

```bash
pip install jupyter
jupyter notebook
```

Open notebooks in this order:

1. 01_data_overview.ipynb
2. 02_baseline_models.ipynb
3. 03_shap_analysis.ipynb
4. 04_feature_augmentation.ipynb
5. 05_wfa_xgb_training.ipynb
6. 06_evaluation.ipynb
7. 07_ablation_study.ipynb

---

### 🏋️ Run Training Pipeline (when implemented)

```bash
python -m src.training.train_pipeline
```

---

### 🌐 Run API (when implemented)

```bash
uvicorn app.api:app --reload
```

---

## 🧪 Testing

```bash
pip install pytest
pytest -q
```

---

## 📦 Deployment Notes

- Treat `models/` as generated artifacts
- Re‑generate models using:

```bash
python -m src.training.train_pipeline
```

- Store production models in object storage (S3, GCS) or a model registry
- Containerize API + models
- Add centralized logging in `src/utils/logger.py`

---

## 🛠️ Common Errors & Fixes

❌ **ModuleNotFoundError: No module named 'xgboost'**  
➡️ `pip install -r requirements.txt`

❌ **ImportError: cannot import name 'XGBClassifier'**  
➡️ Pin version:
```text
xgboost==1.7.6
```

❌ **MemoryError during SHAP/XGBoost**  
➡️ Reduce `n_estimators`, subsample data, or shrink SHAP background

❌ **Notebooks cannot find data**  
➡️ Verify `src/config/paths.py`

❌ **Inconsistent results**  
➡️ Ensure `src/utils/seed.py` is used

---

## 🤝 Contributing

```bash
git checkout -b feature/my-feature
```

- Follow PEP 8
- Add docstrings
- Add/update tests
- Commit format:  
  `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

---

## 📜 License

This project is licensed under the LICENSE file.

---

## ⭐ Acknowledgements

- XGBoost Team
- SHAP Contributors
- UCI Heart Disease Dataset

---

💡 *If you find this project useful, please consider giving it a star on GitHub!*

