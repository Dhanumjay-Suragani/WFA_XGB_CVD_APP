# src/models/wfa_xgb.py

import numpy as np
import pandas as pd
from xgboost import XGBClassifier

import src.models.xgb_focal_loss as focal
from src.features.mutual_information import compute_mutual_information


class WFAXGB:
    """
    Weighted Feature Attribution XGBoost (WFA-XGB)
    """

    def __init__(
        self,
        alpha=0.25,
        gamma=2.0,
        lambda_wfa=0.6,
        xgb_params=None,
        random_state=42,
    ):
        self.alpha = alpha
        self.gamma = gamma
        self.lambda_wfa = lambda_wfa
        self.random_state = random_state

        self.xgb_params = {
            "n_estimators": 400,            # slight increase
            "max_depth": 4,                 # ↓ prevents noisy splits
            "learning_rate": 0.04,
            "min_child_weight": 1,          # ↑ allows interaction capture
            "gamma": 0.0,                   # allow finer splits
            "subsample": 0.9,
            "colsample_bytree": 0.9,
            "max_delta_step": 1,             # ⭐ stabilizes class imbalance
            "eval_metric": "auc",            # ⭐ optimize ranking, not logloss
            "random_state": random_state,
        }



        self.model = None
        self.feature_weights_ = None

    def _normalize(self, values: np.ndarray) -> np.ndarray:
        return (values - values.min()) / (values.max() - values.min() + 1e-8)

    def compute_feature_weights(self, X: pd.DataFrame, y: pd.Series) -> pd.Series:
        """
        Compute WFA weights using SHAP + Mutual Information
        """

        # Train base model
        base_model = XGBClassifier(**self.xgb_params)
        base_model.fit(X, y)

        # SHAP importance
        # Model-based importance (GAIN)
        gain_importance = base_model.get_booster().get_score(importance_type="gain")

        # Align with feature order
        shap_importance = pd.Series(
            [gain_importance.get(f, 0.0) for f in X.columns],
            index=X.columns,
            name="model_gain_importance"
        )


        # Mutual Information
        mi_scores = compute_mutual_information(X, y)

        mi_scores = mi_scores.astype(float)
        shap_importance = shap_importance.astype(float)

        # Normalize
        shap_norm = self._normalize(shap_importance.values)
        mi_norm = self._normalize(mi_scores.values)

        # Weighted fusion
        wfa_weights = (
            self.lambda_wfa * shap_norm + (1 - self.lambda_wfa) * mi_norm
        )

        self.feature_weights_ = pd.Series(
            wfa_weights, index=X.columns, name="wfa_weight"
        )

        return self.feature_weights_

    def _apply_feature_weights(self, X: pd.DataFrame) -> pd.DataFrame:
        return X * self.feature_weights_

    def fit(self, X: pd.DataFrame, y: pd.Series):
        """
        Train WFA-XGB using focal-weighted samples.
        """
    
        # Compute feature weights
        self.compute_feature_weights(X, y)
    
        # Apply feature weights
        X_weighted = self._apply_feature_weights(X)
    
        # Compute focal sample weights
        sample_weights = focal.focal_sample_weights(
            y,
            alpha=self.alpha,
            gamma=self.gamma
        )
    
        # Train final model
        self.model = XGBClassifier(**self.xgb_params)
        self.model.fit(
            X_weighted,
            y,
            sample_weight=sample_weights
        )
    
        return self



    def predict(self, X: pd.DataFrame) -> np.ndarray:
        X_weighted = self._apply_feature_weights(X)
        return self.model.predict(X_weighted)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        X_weighted = self._apply_feature_weights(X)
        return self.model.predict_proba(X_weighted)
