# src/features/shap_extractor.py

import numpy as np
import pandas as pd
import shap
from xgboost import XGBClassifier


class SHAPExtractor:
    """
    Robust SHAP extractor for XGBoost models (Windows-safe).
    """

    def __init__(self, model: XGBClassifier):
        if not hasattr(model, "get_booster"):
            raise ValueError("Model must be a fitted XGBoost model.")

        # IMPORTANT: use Booster directly to avoid UTF-8 decode issues
        booster = model.get_booster()

        self.explainer = shap.TreeExplainer(
            booster,
            feature_perturbation="tree_path_dependent"
        )

    def global_importance(self, X: pd.DataFrame) -> pd.Series:
        """
        Mean absolute SHAP value per feature.
        """

        # Convert to numpy to avoid pandas dtype edge cases
        shap_values = self.explainer.shap_values(X.values)

        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        importance = np.abs(shap_values).mean(axis=0)

        return pd.Series(
            importance,
            index=X.columns,
            name="shap_importance"
        )
